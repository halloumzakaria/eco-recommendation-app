// backend/models/CartItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'carts', key: 'id' },
      onDelete: 'CASCADE'
    },
    
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE'
    },
    
    quantity: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 1,
      validate: { min: 1 }
    },
    
    price_at_purchase: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = CartItem;

