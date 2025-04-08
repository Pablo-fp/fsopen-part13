// File: models/user.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../util/db'); // Adjust path if needed

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'User name cannot be empty' },
        notNull: { msg: 'User name is required' }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Username (email) must be unique' }, // Update unique message slightly
      validate: {
        notEmpty: { msg: 'Username (email) cannot be empty' },
        notNull: { msg: 'Username (email) is required' },
        isEmail: {
          // <-- ADD THIS VALIDATOR
          msg: 'Validation failed: Username must be a valid email address' // Custom message for isEmail failure
        }
      }
    }
    // createdAt and updatedAt are automatically added by Sequelize
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true
  }
);

module.exports = User;
