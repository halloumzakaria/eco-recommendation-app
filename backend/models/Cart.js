// backend/models/Cart.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define(
  'Cart',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for guest carts
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    
    session_id: {
      type: DataTypes.STRING,
      allowNull: true, // For guest carts
    },
    
    status: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'completed', 'abandoned']]
      }
    },
    
    total_price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true,
      defaultValue: 0
    },
    
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Cart;

