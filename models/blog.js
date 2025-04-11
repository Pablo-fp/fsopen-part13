// File: models/blog.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../util/db'); // Adjust path if needed

class Blog extends Model {}

Blog.init(
  {
    // Attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    author: {
      type: DataTypes.TEXT
      // allowNull defaults to true, which matches our schema
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false // Match NOT NULL constraint
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false // Match NOT NULL constraint
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Match DEFAULT 0 constraint
      allowNull: false // Match NOT NULL constraint (often implied by DEFAULT)
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Blog must belong to a user
      references: {
        model: 'users', // table name
        key: 'id'
      }
    }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Blog', // We need to choose the model name
    tableName: 'blogs', // Explicitly define table name
    timestamps: true,
    underscored: true
    // If your DB columns were snake_case (like 'created_at'), set this to true
  }
);

// Note: We are NOT calling sequelize.sync() here because the table
// is created by the commands.sql script via the Docker entrypoint.
// If you weren't using that init script, you would need Blog.sync() or sequelize.sync()
// possibly in your main application startup logic AFTER connecting.

module.exports = Blog;
