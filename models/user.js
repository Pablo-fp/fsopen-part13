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
      type: DataTypes.STRING, // STRING is usually fine unless you expect very long names
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'User name cannot be empty' // Custom validation message
        },
        notNull: {
          msg: 'User name is required'
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        // Ensure usernames are unique
        msg: 'Username must be unique'
      },
      validate: {
        notEmpty: {
          msg: 'Username cannot be empty'
        },
        notNull: {
          msg: 'Username is required'
        }
        // Optional: Add more validation like email format if username is an email
        // isEmail: true,
      }
    }
    // createdAt and updatedAt are automatically added by Sequelize
    // because timestamps: true (which is the default)
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // Explicitly true (default), enables createdAt and updatedAt
    underscored: true // Use snake_case for columns (e.g., created_at, updated_at)
  }
);

// We will use sequelize.sync() in the main app or connection utility
// instead of syncing individual models here.

module.exports = User;
