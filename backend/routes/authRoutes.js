// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hash,
      role: role || "user"
    });

    const userData = newUser.toJSON();
    delete userData.password;

    console.log("User registered successfully:", userData);
    res.status(201).json({ message: "User registered successfully", user: userData });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.SECRET_KEY || "mon_secret_tres_secure",
      { expiresIn: "1h" }
    );

    const userData = user.toJSON();
    delete userData.password;

    res.json({ token, user: userData });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin-only routes for user management
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }
  next();
};

// Get all users (admin only)
router.get("/users", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]]
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user by ID (admin only)
router.get("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user (admin only)
router.put("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    await user.update({ name, email, role });
    const userData = user.toJSON();
    delete userData.password;
    
    res.json({ message: "User updated successfully", user: userData });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Prevent admin from deleting themselves
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
