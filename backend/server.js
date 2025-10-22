// Load env ASAP
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const { sequelize } = require("./models");

// --- Config de base ---
const app = express();
const PORT = process.env.PORT || 5005;
const NODE_ENV = process.env.NODE_ENV || "development";

// URL du service NLP (Flask)
const NLP = process.env.NLP_API_URL || "http://127.0.0.1:5001";
console.log("🧠 NLP_API_URL =", NLP);

// Pour récupérer une IP correcte derrière un proxy (Railway, Nginx, etc.)
app.set("trust proxy", true);

// --- CORS ---
app.use(
  cors({
    origin: [
      "https://eco-recommendation-app-production.up.railway.app",
      "https://eco-recommendation-app-production.railway.app",
      "http://localhost:3000",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

// --- Parsers ---
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// --- Health check backend ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: NODE_ENV,
  });
});

// --- Routes “métier” existantes ---
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// ===================================================================
//                PROXIES → NLP (Flask)  ✅ IMPORTANT
// ===================================================================

// Recherche IA (phrases longues)
app.get("/api/ai-search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const { data } = await axios.get(`${NLP}/ai-search`, {
      params: { q },
      timeout: 5000,
    });
    return res.json(data);
  } catch (e) {
    console.warn("NLP /ai-search failed:", e.message);
    // Fallback simple : pas de résultats, l’UI doit gérer
    return res.json({ results: [] });
  }
});

// Recommandations
app.get("/api/recommend", async (req, res) => {
  try {
    const { user_id, product_id } = req.query;
    const { data } = await axios.get(`${NLP}/recommend`, {
      params: { user_id, product_id },
      timeout: 5000,
    });
    return res.json(data);
  } catch (e) {
    console.warn("NLP /recommend failed:", e.message);
    return res.json({ ok: false, recommendations: [] });
  }
});

// Analyse d'avis (maj eco_rating côté DB via Flask)
app.post("/api/nlp/analyze_review", async (req, res) => {
  try {
    const { product_id, review } = req.body || {};
    const { data } = await axios.post(
      `${NLP}/analyze_review`,
      { product_id, review },
      { timeout: 5000 }
    );
    return res.json(data);
  } catch (e) {
    console.warn("NLP /analyze_review failed:", e.message);
    return res.status(200).json({ message: "analyze_review_skipped" });
  }
});

// Modération de texte (optionnel pour anti-spam)
app.post("/api/nlp/moderate_text", async (req, res) => {
  try {
    const { text } = req.body || {};
    const { data } = await axios.post(
      `${NLP}/moderate_text`,
      { text },
      { timeout: 5000 }
    );
    return res.json(data);
  } catch (e) {
    console.warn("NLP /moderate_text failed:", e.message);
    return res.status(200).json({ ok: false, signals: {} });
  }
});

// ===================================================================

// --- Static (frontend build) ---
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Ne pas servir index.html pour les routes API
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error("❌ Uncaught error:", err.stack || err);
  res.status(500).json({ error: "Something went wrong!" });
});

// --- Bootstrap DB + ping NLP + start ---
const startServer = async () => {
  // DB
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized.");
  } catch (error) {
    console.error("⚠️  Database connection failed:", error.message);
    console.log("🔄 Starting server without database (frontend only mode)");
  }

  // Ping NLP (non bloquant)
  try {
    const { data } = await axios.get(`${NLP}/health`, { timeout: 3000 });
    console.log("🤝 NLP health:", data);
  } catch (e) {
    console.warn(
      "⚠️ NLP indisponible. Vérifie NLP_API_URL et le port Flask.",
      "Raison:", e.message
    );
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL ? "✅ Connected" : "❌ Not available"}`);
  });
};

startServer();
