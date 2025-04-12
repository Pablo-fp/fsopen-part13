// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\migrations\XXXXXXXXXXXXXX-create-reading-lists.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reading_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        // Use snake_case
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      blog_id: {
        // Use snake_case
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'blogs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
      // No timestamps needed here unless specified
    });
    // Add a unique constraint to prevent duplicate entries for the same user/blog pair
    await queryInterface.addConstraint('reading_lists', {
      fields: ['user_id', 'blog_id'],
      type: 'unique',
      name: 'reading_lists_user_blog_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reading_lists');
  }
};
