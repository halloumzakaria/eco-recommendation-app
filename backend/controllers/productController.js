// backend/controllers/productController.js
const axios = require('axios');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../database');
const Product = require('../models/Product');

/* ---------------------------------------------------------
 * Helpers
 * -------------------------------------------------------*/
function normalizeImageArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') return [value.trim()];
  return null;
}

/* ---------------------------------------------------------
 * CRUD
 * -------------------------------------------------------*/
async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      eco_rating,
      eco_score,
      co2_impact,
      material,
      made_in,
      image_url, // string ou array
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      eco_rating,
      eco_score,
      co2_impact,
      material,
      made_in,
      image_url: normalizeImageArray(image_url),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * ✅ Pagination serveur + normalisation image_url
 * Répond : { items, total, page, pageSize, totalPages }
 * (Le front s’appuie sur ce format)
 */
async function getAllProducts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 24, 1), 100);
    const offset = (page - 1) * pageSize;

    // petit filtre texte (optionnel)
    const q = (req.query.q || '').trim();
    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : undefined;

    // total pour pagination (sur la table products)
    const [{ count }] = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM products ${where ? "WHERE name ILIKE :pat OR description ILIKE :pat" : ""};`,
      {
        type: QueryTypes.SELECT,
        replacements: where ? { pat: `%${q}%` } : undefined,
      }
    );

    // page de résultats (on renvoie la 1ère image)
    const rows = await sequelize.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.eco_rating,
        p.eco_score,
        p.co2_impact,
        p.material,
        p.made_in,
        COALESCE(p.image_url[1], '') AS image_url,
        COALESCE(c.name, '')          AS category,
        COALESCE(b.name, '')          AS brand
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands     b ON b.id = p.brand_id
      ${where ? "WHERE p.name ILIKE :pat OR p.description ILIKE :pat" : ""}
      ORDER BY p.id DESC
      LIMIT :limit OFFSET :offset;
      `,
      {
        type: QueryTypes.SELECT,
        replacements: {
          limit: pageSize,
          offset,
          ...(where ? { pat: `%${q}%` } : {}),
        },
      }
    );

    res.json({
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price,
        stock: r.stock,
        eco_rating: r.eco_rating,
        eco_score: r.eco_score,
        co2_impact: r.co2_impact,
        material: r.material,
        made_in: r.made_in,
        category: r.category,
        brand: r.brand,
        views: 0,              // compat front historique
        image_url: r.image_url // string unique
      })),
      total: count,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(count / pageSize), 1),
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits (products):', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getProductById(req, res) {
  try {
    const [row] = await sequelize.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.eco_rating,
        p.eco_score,
        p.co2_impact,
        p.material,
        p.made_in,
        COALESCE(p.image_url[1], '') AS image_url,
        COALESCE(c.name, '')          AS category,
        COALESCE(b.name, '')          AS brand
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands     b ON b.id = p.brand_id
      WHERE p.id = :id
      LIMIT 1;
      `,
      { type: QueryTypes.SELECT, replacements: { id: req.params.id } }
    );

    if (!row) return res.status(404).json({ msg: 'Produit non trouvé' });
    res.json({ ...row, views: 0 });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du produit (products):', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateProduct(req, res) {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ msg: 'Produit non trouvé' });

    const {
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      eco_rating,
      eco_score,
      co2_impact,
      material,
      made_in,
      image_url,
    } = req.body;

    await p.update({
      name,
      description,
      price,
      stock,
      category_id,
      brand_id,
      eco_rating,
      eco_score,
      co2_impact,
      material,
      made_in,
      image_url: normalizeImageArray(image_url),
    });

    res.json({ msg: 'Produit mis à jour avec succès', product: p });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deleteProduct(req, res) {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ msg: 'Produit non trouvé' });

    await p.destroy();
    res.json({ msg: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function incrementProductView(_req, res) {
  try {
    res.json({ msg: 'No-op: views non géré sur le nouveau schéma', views: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getPopularProducts(_req, res) {
  try {
    const rows = await sequelize.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        COALESCE(p.image_url[1], '') AS image_url,
        COALESCE(c.name, '')          AS category,
        COALESCE(b.name, '')          AS brand,
        p.eco_rating,
        p.eco_score
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands     b ON b.id = p.brand_id
      ORDER BY p.eco_rating DESC NULLS LAST, p.eco_score DESC NULLS LAST, p.id DESC
      LIMIT 5;
      `,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits populaires :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/* ---------------------------------------------------------
 * Recherche IA / FTS (inchangé par rapport à ta version précédente)
 * -------------------------------------------------------*/
async function aiSearch(req, res) {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });

  try {
    const { data } = await axios.get('http://eco-nlp:5001/ai-search', {
      params: { q },
      timeout: 2500,
    });
    const results = Array.isArray(data?.results) ? data.results : [];
    return res.json({ results });
  } catch (e) {
    console.warn('⚠️ NLP indisponible, fallback FTS Postgres. Raison:', e.message);
  }

  try {
    const rows = await sequelize.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        COALESCE(c.name, '')          AS category,
        p.price,
        COALESCE(p.image_url[1], '') AS image_url,
        p.eco_rating,
        ts_rank_cd(p.search_vector, plainto_tsquery('simple', unaccent(:q))) AS score
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.search_vector @@ plainto_tsquery('simple', unaccent(:q))
      ORDER BY score DESC, p.eco_rating DESC NULLS LAST, p.id DESC
      LIMIT 24;
      `,
      { type: QueryTypes.SELECT, replacements: { q } }
    );

    if (!rows.length) {
      const likeRows = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
          ],
        },
        limit: 24,
      });

      return res.json({
        results: likeRows.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: '',
          price: p.price,
          image_url: Array.isArray(p.image_url) ? (p.image_url[0] || '') : '',
          eco_rating: p.eco_rating,
          score: 0.1,
        })),
      });
    }

    return res.json({
      results: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        price: r.price,
        image_url: r.image_url,
        eco_rating: r.eco_rating,
        score: Number(r.score ?? 0),
      })),
    });
  } catch (err) {
    console.error('❌ FTS fallback error:', err);
    return res.json({ results: [] });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  incrementProductView,
  getPopularProducts,
  aiSearch,
};
