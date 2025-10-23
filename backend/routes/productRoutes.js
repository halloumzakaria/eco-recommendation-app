// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const auth = require("../middlewares/authMiddleware");

const reviewRoutes = require("./reviewRoutes");

// ────────────────────────────────────────────────────────────
// 🔓 Public product routes (no token required)
// ────────────────────────────────────────────────────────────

// AI search (NLP + fallback)
router.get("/search", productController.aiSearch);

// List products (pagination + text/ID search via ?q= / ?id= / ?ids=)
router.get("/", productController.getAllProducts);

// ────────────────────────────────────────────────────────────
// 🔒 Protected routes that must come BEFORE the :id route
// ────────────────────────────────────────────────────────────

// ✅ Keep popular protected
router.get("/popular", auth, productController.getPopularProducts);

// Track views (keep protected; make public if you prefer)
router.post("/:id/view", auth, productController.incrementProductView);

// Reviews
router.use("/:id/reviews", reviewRoutes);

// Reviews via NLP (protected)
router.post("/:id/review", auth, async (req, res, next) => {
  // The review logic is already implemented in your previous routes file;
  // if you prefer centralizing in controller, move it there and call it here.
  try {
    const axios = require("axios");
    const { review } = req.body;
    if (!review || !review.trim()) {
      return res.status(400).json({ error: "Review text is required" });
    }
    const NLP_API_URL = process.env.NLP_API_URL || "http://127.0.0.1:5001";
    const response = await axios.post(`${NLP_API_URL}/analyze_review`, {
      product_id: req.params.id,
      review,
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ NLP error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to analyze review" });
  }
});

// ────────────────────────────────────────────────────────────
// 🔓 Public single product route (after special paths above)
// ────────────────────────────────────────────────────────────
router.get("/:id", productController.getProductById);


// ────────────────────────────────────────────────────────────
// 🔒 Admin-only writes
// ────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }
  next();
};

router.post("/", auth, requireAdmin, productController.createProduct);
router.put("/:id", auth, requireAdmin, productController.updateProduct);
router.delete("/:id", auth, requireAdmin, productController.deleteProduct);

module.exports = router;