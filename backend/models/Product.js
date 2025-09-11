// models/Product.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.TEXT,    allowNull: true },
  price:       { type: DataTypes.FLOAT,   allowNull: false },
  category:    { type: DataTypes.STRING,  allowNull: false },
  eco_rating:  { type: DataTypes.FLOAT, allowNull: false },
  views:       { type: DataTypes.INTEGER, defaultValue: 0 },
  image_url:   { type: DataTypes.TEXT,    allowNull: false }
}, {
  tableName: "Products",
  timestamps: false
});

module.exports = Product;
