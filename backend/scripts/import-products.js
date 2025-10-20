// backend/scripts/import-products.js
/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');

/* -------------------------------------------------------
 * 1) DEBUG : afficher la base cible (host/port/db)
 * -----------------------------------------------------*/
try {
  const u = new URL(process.env.DATABASE_URL);
  console.log('→ Import cible :', u.hostname, u.port || '(default)', u.pathname);
} catch {
  console.error('❌ DATABASE_URL invalide ou manquante. Vérifie backend/.env');
  process.exit(1);
}

/* -------------------------------------------------------
 * 2) Connexion Sequelize (Railway public → SSL require)
 * -----------------------------------------------------*/
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

/* -------------------------------------------------------
 * 3) Modèle aligné sur la table "Products"
 *    (selon \d "Products")
 * -----------------------------------------------------*/
const Product = sequelize.define(
  'Product',
  {
    name:        { type: DataTypes.STRING,  allowNull: false },
    description: { type: DataTypes.TEXT,    allowNull: false },
    price:       { type: DataTypes.DOUBLE,  allowNull: false },
    category:    { type: DataTypes.STRING,  allowNull: false },
    eco_rating:  { type: DataTypes.DOUBLE,  allowNull: false, defaultValue: 3 },
    image_url:   { type: DataTypes.TEXT,    allowNull: false },
    views:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    // colonnes optionnelles (NULL)
    brand:          { type: DataTypes.TEXT, allowNull: true },
    certifications: { type: DataTypes.TEXT, allowNull: true },
    tags:           { type: DataTypes.TEXT, allowNull: true },
    source_url:     { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'Products',
    timestamps: true,            // utilise "createdAt" / "updatedAt"
    underscored: false,          // garde le camelCase exact
  }
);

/* -------------------------------------------------------
 * 4) Helpers
 * -----------------------------------------------------*/
const REQUIRED_COLS = [
  'name', 'description', 'price', 'category', 'eco_rating', 'image_url', 'views',
];
const OPTIONAL_COLS = ['brand', 'certifications', 'tags', 'source_url'];

async function ensureColumnsExist() {
  const cols = await sequelize.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema='public' AND table_name='Products';`,
    { type: QueryTypes.SELECT }
  );
  const have = new Set(cols.map((c) => c.column_name));

  const missingRequired = REQUIRED_COLS.filter((c) => !have.has(c));
  if (missingRequired.length) {
    throw new Error(
      `Colonnes obligatoires manquantes dans "Products": ${missingRequired.join(', ')}`
    );
  }

  const missingOptional = OPTIONAL_COLS.filter((c) => !have.has(c));
  if (missingOptional.length) {
    console.warn('⚠️ Colonnes optionnelles absentes (ignorées) :', missingOptional.join(', '));
  }
  return { have };
}

function pickDefaults(row, haveCols) {
  const d = {
    name:        (row.name || '').trim(),
    description: row.description || '',
    price:       parseFloat(row.price || '0'),
    category:    row.category || 'misc',
    eco_rating:  parseFloat(row.eco_rating || '3'),
    image_url:   row.image_url || '',   // NOT NULL
    views:       0,
  };
  if (haveCols.has('brand'))          d.brand = row.brand || null;
  if (haveCols.has('certifications')) d.certifications = row.certifications || null;
  if (haveCols.has('tags'))           d.tags = row.tags || null;
  if (haveCols.has('source_url'))     d.source_url = row.source_url || null;
  return d;
}

/* -------------------------------------------------------
 * 5) Programme principal
 * -----------------------------------------------------*/
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK');

    const { have } = await ensureColumnsExist();

    const file = path.join(__dirname, 'products_bulk.csv');
    if (!fs.existsSync(file)) {
      console.error(`❌ Fichier CSV introuvable : ${file}`);
      process.exit(1);
    }
    const content = fs.readFileSync(file, 'utf8');
    const rows = csv.parse(content, { columns: true, skip_empty_lines: true });

    let createdCount = 0, updatedCount = 0, skipped = 0;

    for (const r of rows) {
      const name = (r.name || '').trim();
      if (!name) { skipped++; continue; }

      const where = (r.brand && r.brand.trim())
        ? { name, brand: r.brand.trim() }
        : { name };

      const defaults = pickDefaults(r, have);

      // On ne récupère que l'id pour éviter un RETURNING trop large
      const [prod, created] = await Product.findOrCreate({
        where,
        defaults,
        attributes: ['id'],
      });

      if (created) {
        createdCount++;
      } else {
        await prod.update(defaults);
        updatedCount++;
      }
    }

    console.log(`✅ Import terminé : ${createdCount} créés, ${updatedCount} mis à jour, ${skipped} ignorés.`);
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Import error:\n', e);
    try { await sequelize.close(); } catch {}
    process.exit(1);
  }
})();
