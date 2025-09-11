const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Serve static files from frontend build (always in Railway)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Handle React routing - return index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Try to connect to database
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized.");
  } catch (error) {
    console.error("⚠️  Database connection failed:", error.message);
    console.log("🔄 Starting server without database (frontend only mode)");
  }
  
  // Start server regardless of database connection
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not available'}`);
  });
};

startServer();