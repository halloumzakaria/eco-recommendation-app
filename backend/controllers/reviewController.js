const { Review, Product } = require("../models");
const axios = require("axios");

exports.getReviewMeta = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await Review.findAll({
      where: { product_id: productId },
      attributes: [
        [Review.sequelize.fn("AVG", Review.sequelize.col("rating")), "avg_rating"],
        [Review.sequelize.fn("COUNT", Review.sequelize.col("id")), "reviews_count"],
      ],
      raw: true,
    });
    res.json(result[0] || { avg_rating: 0, reviews_count: 0 });
  } catch (err) {
    console.error("❌ getReviewMeta error:", err);
    res.status(500).json({ error: "Failed to fetch review meta" });
  }
};

exports.listReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { rows, count } = await Review.findAndCountAll({
      where: { product_id: productId },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.json({
      reviews: rows,
      total: count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error("❌ listReviews error:", err);
    res.status(500).json({ error: "Failed to list reviews" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, title, body, authorName } = req.body;
    const user = req.user || {};

    if (!rating || !body) {
      return res.status(400).json({ error: "Missing rating or review body" });
    }

    const newReview = await Review.create({
      product_id: productId,
      user_id: user.id || null,
      author_name: authorName || user.name || "Anonymous",
      rating,
      title: title || null,
      body,
    });

    // Analyse NLP (non bloquant)
    const flaskUrl = (process.env.NLP_API_URL || "http://127.0.0.1:5001") + "/analyze_review";
    let sentiment = "neutral";
    try {
      const { data } = await axios.post(flaskUrl, { review: body, product_id: productId });
      sentiment = data.sentiment || "neutral";
      await newReview.update({ sentiment });
    } catch (err) {
      console.warn("⚠️ NLP API not reachable:", err.message);
    }

    // Recalcule eco_rating ~ moyenne 1..5 depuis sentiments
    const all = await Review.findAll({ where: { product_id: productId } });
    if (all.length > 0) {
      const avgSentiment =
        all.reduce((acc, r) => {
          if (r.sentiment === "positive") return acc + 1;
          if (r.sentiment === "negative") return acc - 1;
          return acc;
        }, 0) / all.length;

      const eco = Math.max(1, Math.min(5, 3 + avgSentiment * 2));
      await Product.update({ eco_rating: eco }, { where: { id: productId } });
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    console.error("❌ createReview error:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
};
