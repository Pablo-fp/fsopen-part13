// filepath: migrations/YYYYMMDDHHMMSS-add_year_to_blogs.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('blogs', 'year', {
      type: Sequelize.INTEGER,
      allowNull: true // Or false if year is mandatory for all blogs
      // Add database-level check constraint (optional but recommended)
      // Note: SQLite does not support ADD CONSTRAINT directly like this
      // For PostgreSQL:
      // validate: {
      //   min: 1991,
      //   max: new Date().getFullYear() // Ensure this runs correctly in migration context
      // }
      // A safer way for DB constraint is raw SQL if needed, but model validation is primary
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('blogs', 'year');
  }
};
