// backend/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Nouveau schéma : table 'products' en snake_case
 * (ancienne table "Products" obsolète)
 *
 * Note: image_url est un tableau de TEXT dans Postgres (text[])
 * On garde timestamps mappés sur created_at / updated_at
 */
const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    name: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },

    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },

    eco_rating: { type: DataTypes.DECIMAL(2, 1), allowNull: true },
    eco_score: { type: DataTypes.INTEGER, allowNull: true },
    co2_impact: { type: DataTypes.DECIMAL(10, 3), allowNull: true },

    material: { type: DataTypes.TEXT, allowNull: true },
    made_in: { type: DataTypes.TEXT, allowNull: true },

    // Postgres text[] ; si jamais tu n'es pas en PG localement, remplace par DataTypes.TEXT
    image_url: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },

    category_id: { type: DataTypes.INTEGER, allowNull: true },
    brand_id: { type: DataTypes.INTEGER, allowNull: true },
    seller_id: { type: DataTypes.INTEGER, allowNull: true },

    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,       // mappe created_at / updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Product;
