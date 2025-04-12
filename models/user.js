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
      unique: { msg: 'Username (email) must be unique' },
      validate: {
        notEmpty: { msg: 'Username (email) cannot be empty' },
        notNull: { msg: 'Username (email) is required' },
        isEmail: {
          msg: 'Validation failed: Username must be a valid email address'
        }
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        notNull: { msg: 'Password is required' }
      }
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'User',

    tableName: 'users',
    timestamps: true,
    underscored: true,
    defaultScope: {
      // Exclude passwordHash by default for security reasons
      attributes: { exclude: ['passwordHash', 'disabled'] }
    },
    scopes: {
      // This scope disables the exclusion so that passwordHash is included
      withPassword: {
        attributes: {}
      }
    },
    // Optional scope to include disabled status if needed elsewhere
    withStatus: {
      attributes: { exclude: ['passwordHash'] } // Exclude only password
    }
  }
);

module.exports = User;
