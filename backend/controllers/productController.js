// backend/controllers/productController.js

const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../database");
const Product = require("../models/Product");
const nlp = require("../services/nlpClient"); // centralized NLP client

/* ---------------------------------------------------------
 * Helpers
 * -------------------------------------------------------*/
function normalizeImageArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") return [value.trim()];
  return null;
}

/**
 * Parse IDs from:
 *  - query params: ?id=123 or ?ids=1,2,9
 *  - text query: "123", "id:123", "id=123", "#123", "1, 2, 9"
 */
function parseIdsFromQuery(q, idParam, idsParam) {
  // explicit params first
  if (idParam && /^\d+$/.test(String(idParam))) return [Number(idParam)];
  if (idsParam) {
    const list = String(idsParam)
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s))
      .map((n) => Number(n));
    if (list.length) return list;
  }

  // from free text
  const cleaned = String(q || "").trim();
  if (!cleaned) return [];

  // multiple IDs: "1, 2, 9"
  if (/^\s*\d+(?:\s*,\s*\d+)+\s*$/.test(cleaned)) {
    return cleaned.split(",").map((s) => Number(s.trim()));
  }

  // single ID: "123", "id:123", "id=123", "#123"
  const m = cleaned.match(/^(?:id\s*[:=]\s*|#)?(\d+)$/i);
  if (m) return [Number(m[1])];

  return [];
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
      image_url, // string or array
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
    console.error("❌ Erreur lors de la création du produit :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * ✅ Paginated list with optional text search OR explicit ID search
 * Responds: { items, total, page, pageSize, totalPages }
 */
async function getAllProducts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 24, 1), 100);
    const offset = (page - 1) * pageSize;

    const q = (req.query.q || "").trim();
    const ids = parseIdsFromQuery(q, req.query.id, req.query.ids);

    // --- ID search short-circuit (no count query; we just return found items)
    if (ids.length) {
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
        WHERE p.id IN (:ids)
        ORDER BY p.id DESC;
        `,
        { type: QueryTypes.SELECT, replacements: { ids } }
      );

      return res.json({
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
          views: 0,
          image_url: r.image_url,
        })),
        total: rows.length,
        page: 1,
        pageSize: rows.length || 1,
        totalPages: 1,
      });
    }

    // --- Text search path
    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : undefined;

    const [{ count }] = await sequelize.query(
      `SELECT COUNT(*)::int AS count FROM products ${
        where ? "WHERE name ILIKE :pat OR description ILIKE :pat" : ""
      };`,
      {
        type: QueryTypes.SELECT,
        replacements: where ? { pat: `%${q}%` } : undefined,
      }
    );

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
        views: 0, // front compat
        image_url: r.image_url,
      })),
      total: count,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(count / pageSize), 1),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des produits (products):", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ msg: "ID invalide" });

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
      { type: QueryTypes.SELECT, replacements: { id } }
    );

    if (!row) return res.status(404).json({ msg: "Produit non trouvé" });
    res.json({ ...row, views: 0 });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du produit (products):", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateProduct(req, res) {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ msg: "Produit non trouvé" });

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

    res.json({ msg: "Produit mis à jour avec succès", product: p });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du produit :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteProduct(req, res) {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ msg: "Produit non trouvé" });

    await p.destroy();
    res.json({ msg: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du produit :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function incrementProductView(_req, res) {
  try {
    res.json({ msg: "No-op: views non géré sur le nouveau schéma", views: 0 });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
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
    console.error("❌ Erreur lors de la récupération des produits populaires :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/* ---------------------------------------------------------
 * 🔎 Recherche IA / FTS (NLP + fallback Postgres) + ID search
 * -------------------------------------------------------*/
async function aiSearch(req, res) {
  const q = (req.query.q || "").trim();
  if (!q && !req.query.id && !req.query.ids) return res.json({ results: [] });

  // --- ID short-circuit
  const ids = parseIdsFromQuery(q, req.query.id, req.query.ids);
  if (ids.length) {
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
          p.eco_rating
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id IN (:ids)
        ORDER BY p.id DESC;
        `,
        { type: QueryTypes.SELECT, replacements: { ids } }
      );

      return res.json({
        results: rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          category: r.category,
          price: r.price,
          image_url: r.image_url,
          eco_rating: r.eco_rating,
          score: 1.0, // max relevance for explicit ID requests
        })),
      });
    } catch (err) {
      console.error("❌ ID search error:", err);
      // continue to text search below
    }
  }

  // 1) Try NLP
  try {
    const aiResults = await nlp.searchAI(q); // returns [] or array of products
    if (Array.isArray(aiResults) && aiResults.length > 0) {
      return res.json({ results: aiResults });
    }
    console.warn("NLP returned empty results, using FTS fallback.");
  } catch (e) {
    console.warn("⚠️ NLP indisponible, fallback FTS Postgres. Raison:", e.message);
  }

  // 2) Fallback FTS Postgres
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
      // fallback LIKE
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
          category: "",
          price: p.price,
          image_url: Array.isArray(p.image_url) ? p.image_url[0] || "" : "",
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
    console.error("❌ FTS fallback error:", err);
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
