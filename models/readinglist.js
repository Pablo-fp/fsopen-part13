// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\models\readinglist.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../util/db');

class ReadingList extends Model {}

ReadingList.init(
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
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'blogs', key: 'id' }
    },
    read: {
      // Although not required yet, good to include
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    underscored: true,
    timestamps: false, // No createdAt/updatedAt needed for join table
    modelName: 'reading_list' // Use snake_case for table name consistency
  }
);

module.exports = ReadingList;
