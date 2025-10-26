// models/index.js
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const UserInteraction = require("./userInteractions");
const Review = require("./Review");

// Define associations
Product.hasMany(Review, { foreignKey: "product_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Product,
  UserInteraction,
  Review
};
