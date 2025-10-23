// backend/routes/reviewRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/authMiddleware");

// Récupère la moyenne et le nombre d'avis
router.get("/meta", reviewController.getReviewMeta);

// Liste des avis
router.get("/", reviewController.listReviews);

// Ajout d’un avis (auth facultative selon ton besoin)
router.post("/", auth, reviewController.createReview);

module.exports = router;
