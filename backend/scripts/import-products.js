// backend/scripts/import-products.js
/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { Sequelize, DataTypes, Op } = require('sequelize');

/* 1) Afficher la base cible */
try {
  const u = new URL(process.env.DATABASE_URL);
  console.log('→ Import cible :', u.hostname, u.port || '(default)', u.pathname);
} catch {
  console.error('❌ DATABASE_URL invalide ou manquante. Vérifie backend/.env');
  process.exit(1);
}

/* 2) Connexion Sequelize (Railway => SSL) */
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});

/* 3) Modèles minimaux alignés sur ton schéma */
const Brand = sequelize.define(
  'Brand',
  {
    id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { tableName: 'brands', timestamps: false }
);

const Category = sequelize.define(
  'Category',
  {
    id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
  },
  { tableName: 'categories', timestamps: false }
);

const Product = sequelize.define(
  'Product',
  {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT },
    price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock:       { type: DataTypes.INTEGER, defaultValue: 0 },
    eco_rating:  { type: DataTypes.DECIMAL(2, 1) },
    eco_score:   { type: DataTypes.INTEGER },
    co2_impact:  { type: DataTypes.DECIMAL(10, 3) },
    material:    { type: DataTypes.TEXT },
    made_in:     { type: DataTypes.TEXT },
    image_url:   { type: DataTypes.ARRAY(DataTypes.TEXT) }, // <— tableau
    category_id: { type: DataTypes.INTEGER },
    brand_id:    { type: DataTypes.INTEGER },
    seller_id:   { type: DataTypes.INTEGER },
    // search_vector est géré côté DB via trigger
  },
  {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

/* 4) Helpers pour retrouver/créer brand & category */
async function ensureBrandId(brandName) {
  if (!brandName || !brandName.trim()) return null;
  const name = brandName.trim();
  const [b] = await Brand.findOrCreate({ where: { name } });
  return b.id;
}

async function ensureCategoryId(categoryName) {
  if (!categoryName || !categoryName.trim()) return null;
  const name = categoryName.trim();
  const [c] = await Category.findOrCreate({ where: { name } });
  return c.id;
}

function toImageArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const s = String(val).trim();
  if (!s) return [];
  // accepte “url1, url2 …” ou une seule url
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

/* 5) Programme principal */
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK');

    const csvPath = path.join(__dirname, 'products_bulk.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Fichier CSV introuvable : ${csvPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const rows = csv.parse(content, { columns: true, skip_empty_lines: true });

    let created = 0, updated = 0, skipped = 0;

    for (const r of rows) {
      const name = (r.name || '').trim();
      if (!name) { skipped++; continue; }

      // Colonnes CSV attendues (toutes optionnelles sauf name/price) :
      // name, description, price, category, brand, eco_rating, eco_score, co2_impact,
      // material, made_in, image_url (une URL ou “url1, url2”), stock
      const price = r.price != null ? String(r.price).replace(',', '.') : '0';
      const eco_rating = r.eco_rating != null ? String(r.eco_rating).replace(',', '.') : null;
      const co2_impact = r.co2_impact != null ? String(r.co2_impact).replace(',', '.') : null;

      // Résoudre brand/category → id (création si besoin)
      const brand_id = await ensureBrandId(r.brand);
      const category_id = await ensureCategoryId(r.category);

      // image_url → tableau text[]
      const imageArr = toImageArray(r.image_url);

      const payload = {
        name,
        description: r.description || '',
        price,
        stock: r.stock ? parseInt(r.stock, 10) : 0,
        eco_rating,
        eco_score: r.eco_score ? parseInt(r.eco_score, 10) : null,
        co2_impact,
        material: r.material || null,
        made_in: r.made_in || null,
        image_url: imageArr,
        category_id,
        brand_id,
      };

      // clef “logique” : (name + brand_id) si brand existe, sinon (name)
      const where = brand_id ? { name, brand_id } : { name };

      const existing = await Product.findOne({ where, attributes: ['id'] });

      if (existing) {
        await Product.update(payload, { where: { id: existing.id } });
        updated++;
      } else {
        await Product.create(payload);
        created++;
      }
    }

    console.log(`✅ Import terminé : ${created} créés, ${updated} mis à jour, ${skipped} ignorés.`);
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Import error:\n', e);
    try { await sequelize.close(); } catch {}
    process.exit(1);
  }
})();
