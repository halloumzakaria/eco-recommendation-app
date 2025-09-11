// models/index.js
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const UserInteraction = require("./userInteractions");

// (Optionnel) Définir les associations si nécessaire :
// User.hasMany(UserInteraction, { foreignKey: "user_id" });
// Product.hasMany(UserInteraction, { foreignKey: "product_id" });

module.exports = {
  sequelize,
  User,
  Product,
  UserInteraction
};
