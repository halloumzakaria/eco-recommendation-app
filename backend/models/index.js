// models/index.js
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const UserInteraction = require("./userInteractions");
const Review = require("./Review");
const Cart = require("./Cart");
const CartItem = require("./CartItem");

// Define associations
Product.hasMany(Review, { foreignKey: "product_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

// Cart associations
User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });
Cart.hasMany(CartItem, { foreignKey: "cart_id" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
Product.hasMany(CartItem, { foreignKey: "product_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

module.exports = {
  sequelize,
  User,
  Product,
  UserInteraction,
  Review,
  Cart,
  CartItem
};
