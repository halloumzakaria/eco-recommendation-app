// backend/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Utilise JWT_SECRET (avec fallback sur SECRET_KEY pour compat)
    const secret = process.env.JWT_SECRET || process.env.SECRET_KEY || "mon_secret_tres_secure";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
