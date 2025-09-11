const express = require("express");
const axios = require("axios");
const { Product, UserInteraction } = require("../models");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ———————————————————————————————————————————————————————————
// 🔹 Routes publiques

// 🔍 Recherche intelligente IA
router.get("/search", productController.aiSearch);

// ✅ Afficher tous les produits
router.get("/", productController.getAllProducts);

// Produits populaires (protégé)
router.get("/popular", authMiddleware, productController.getPopularProducts);

// Voir un produit (protégé)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (req.user) {
      await UserInteraction.create({
        user_id: req.user.id,
        product_id: product.id,
        interaction_type: "view"
      });
      product.views++;
      await product.save();
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Ajouter une review avec NLP
router.post("/:id/review", authMiddleware, async (req, res) => {
  try {
    const { review } = req.body;
    console.log(`📌 Backend: Submitting review for product ${req.params.id}: ${review}`);
    
    // Use the Docker service name instead of localhost
    const response = await axios.post("http://eco-nlp:5001/analyze_review", {
      product_id: req.params.id,
      review
    });
    
    console.log("✅ Backend: NLP response received:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Backend: NLP Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to analyze review. Please try again." });
  }
});

// ———————————————————————————————————————————————————————————
// 🔒 Routes admin uniquement

const requireAdmin = (req, res, next) => {
  console.log("🔍 ROLE CHECK:", req.user);
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }
  next();
};

router.post("/", authMiddleware, requireAdmin, productController.createProduct);
router.put("/:id", authMiddleware, requireAdmin, productController.updateProduct);
router.delete("/:id", authMiddleware, requireAdmin, productController.deleteProduct);
router.post("/:id/view", authMiddleware, productController.incrementProductView);

module.exports = router;
