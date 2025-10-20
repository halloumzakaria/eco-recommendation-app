// backend/controllers/productController.js
const axios = require('axios');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('../models/Product');

// ===================================================
// 🧩 CRUD PRODUITS
// ===================================================

async function createProduct(req, res) {
  try {
    const { name, description, price, category, eco_rating, image_url, brand, tags, certifications } = req.body;
    const product = await Product.create({ name, description, price, category, eco_rating, image_url, brand, tags, certifications });
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getAllProducts(_req, res) {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Produit non trouvé' });
    res.json(product);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateProduct(req, res) {
  try {
    const { name, description, price, category, eco_rating, image_url, brand, tags, certifications } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Produit non trouvé' });

    await product.update({ name, description, price, category, eco_rating, image_url, brand, tags, certifications });
    res.json({ msg: 'Produit mis à jour avec succès', product });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Produit non trouvé' });

    await product.destroy();
    res.json({ msg: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du produit :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function incrementProductView(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Produit non trouvé' });

    product.views += 1;
    await product.save();
    res.json({ msg: 'Vue ajoutée', views: product.views });
  } catch (error) {
    console.error("❌ Erreur lors de l'incrémentation des vues :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getPopularProducts(_req, res) {
  try {
    const products = await Product.findAll({
      order: [['views', 'DESC']],
      limit: 5,
    });
    res.json(products);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits populaires :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ===================================================
// 🔍 Recherche IA + Fallback FTS + Fallback ILIKE
// ===================================================

async function aiSearch(req, res) {
  const qRaw = (req.query.q || '').trim();
  if (!qRaw) return res.json({ results: [] });

  // 1️⃣ Étendre la requête via NLP (non bloquant)
  let q = qRaw;
  try {
    const nlpUrl = process.env.NLP_API_URL || 'http://localhost:5001/ai-search';
    const { data } = await axios.get(nlpUrl, { params: { q: qRaw }, timeout: 2000 });
    if (data && typeof data.expanded === 'string' && data.expanded.trim()) {
      q = data.expanded.trim();
    }
  } catch {
    q = qRaw;
  }

  try {
    // 2️⃣ FTS Postgres
    const ftsSql = `
      SELECT
        id, name, description, category, price, image_url, eco_rating, views,
        ts_rank_cd(search_vector, websearch_to_tsquery('simple', unaccent(:q))) AS score
      FROM "Products"
      WHERE search_vector @@ websearch_to_tsquery('simple', unaccent(:q))
      ORDER BY score DESC, eco_rating DESC, views DESC
      LIMIT 24;
    `;
    let rows = await sequelize.query(ftsSql, {
      type: QueryTypes.SELECT,
      replacements: { q },
    });

    // 3️⃣ Fallback ILIKE
    if (!rows.length) {
      const likeRows = await Product.findAll({
        where: {
          [Op.or]: [
            { name:           { [Op.iLike]: `%${qRaw}%` } },
            { description:    { [Op.iLike]: `%${qRaw}%` } },
            { category:       { [Op.iLike]: `%${qRaw}%` } },
            { brand:          { [Op.iLike]: `%${qRaw}%` } },
            { tags:           { [Op.iLike]: `%${qRaw}%` } },
            { certifications: { [Op.iLike]: `%${qRaw}%` } },
          ],
        },
        limit: 24,
        order: [['eco_rating', 'DESC'], ['views', 'DESC']],
      });

      rows = likeRows.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: Number(p.price),
        image_url: p.image_url,
        eco_rating: Number(p.eco_rating),
        views: Number(p.views || 0),
        score: 0.2,
      }));
    } else {
      rows = rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        price: Number(r.price),
        image_url: r.image_url,
        eco_rating: Number(r.eco_rating),
        views: Number(r.views || 0),
        score: Number(r.score || 0),
      }));
    }

    return res.json({ results: rows });
  } catch (err) {
    console.error('❌ Search error:', err);
    return res.status(500).json({ error: 'search_failed', results: [] });
  }
}

// ===================================================
// Exports
// ===================================================
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
