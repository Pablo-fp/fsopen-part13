// filepath: migrations/XXXXXXXXXXXXXX-initialize_blogs_and_users.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        // Assuming username is the email field based on model validation
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          // Note: model-level validation like isEmail is not enforced at DB level by default
          isEmail: true
        }
      },
      password_hash: {
        // Column name based on model's underscored: true
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        // Column name based on model's underscored: true
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        // Column name based on model's underscored: true
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create blogs table
    await queryInterface.createTable('blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      author: {
        type: Sequelize.TEXT
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      user_id: {
        // Column name based on model's underscored: true
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          // Foreign key constraint
          model: 'users', // Name of the referenced table
          key: 'id'
        },
        onUpdate: 'CASCADE', // Optional: Specify behavior on update/delete
        onDelete: 'CASCADE' // Optional: Or 'SET NULL' if userId can be nullable
      },
      created_at: {
        // Column name based on model's underscored: true
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        // Column name based on model's underscored: true
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order of creation due to foreign key constraints
    await queryInterface.dropTable('blogs');
    await queryInterface.dropTable('users');
  }
};
