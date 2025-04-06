// File: util/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false // Disable logging SQL queries or set to console.log for debugging
    // logging: (...msg) => console.log('SEQUELIZE:', msg), // Example detailed logging
  }
);

// Function to test connection
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Exit process if connection fails, as the app can't function
    process.exit(1);
  }
};

module.exports = { sequelize, connectToDatabase };
