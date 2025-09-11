// models/userInteractions.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserInteraction = sequelize.define("UserInteraction", {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:          {
                      type: DataTypes.INTEGER,
                      allowNull: false,
                      references: { model: "Users", key: "id" },
                      onDelete: "CASCADE"
                    },
  product_id:       {
                      type: DataTypes.INTEGER,
                      allowNull: false,
                      references: { model: "Products", key: "id" },
                      onDelete: "CASCADE"
                    },
  interaction_type: { type: DataTypes.STRING, allowNull: false },
  timestamp:        { type: DataTypes.DATE,   defaultValue: DataTypes.NOW }
}, {
  tableName: "UserInteractions",
  timestamps: false
});

module.exports = UserInteraction;
