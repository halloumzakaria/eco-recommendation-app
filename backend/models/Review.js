// backend/models/Review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define(
  'Review',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    },
    
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL'
    },
    
    rating: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.TEXT, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    author_name: { type: DataTypes.STRING, allowNull: true },
    sentiment: { type: DataTypes.STRING, allowNull: true },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Review;
