// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// ⚠️ Import direct du modèle aligné sur la table "users"
const User = require("../models/User");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Utils
const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY || "mon_secret_tres_secure";

// -----------------------------
// POST /api/auth/register
// -----------------------------
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash du mot de passe -> champ password_hash
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password_hash,
      // on accepte le role s'il est fourni, sinon 'user' (à sécuriser si besoin)
      role: role && typeof role === "string" ? role.toLowerCase() : "user",
    });

    const userData = newUser.toJSON();
    delete userData.password_hash;

    console.log("User registered successfully:", userData);
    res.status(201).json({ message: "User registered successfully", user: userData });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// -----------------------------
// POST /api/auth/login
// -----------------------------
router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Comparaison avec password_hash
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({ token, user: userData });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -----------------------------
// GET /api/auth/me
// -----------------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -----------------------------
// Admin guard
// -----------------------------
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }
  next();
};

// -----------------------------
// GET /api/auth/users (admin)
// -----------------------------
router.get("/users", authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["id", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -----------------------------
// GET /api/auth/users/:id (admin)
// -----------------------------
router.get("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -----------------------------
// PUT /api/auth/users/:id (admin)
// -----------------------------
router.put("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ message: "Email already exists" });
    }

    await user.update({ name, email, role });
    const userData = user.toJSON();
    delete userData.password_hash;

    res.json({ message: "User updated successfully", user: userData });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// -----------------------------
// DELETE /api/auth/users/:id (admin)
// -----------------------------
router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
