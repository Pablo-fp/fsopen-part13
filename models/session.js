// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\models\session.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../util/db');

class Session extends Model {}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: true, // Enable createdAt/updatedAt
    modelName: 'session'
  }
);

module.exports = Session;
