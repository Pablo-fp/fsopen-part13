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
    logging: false // Disable logging or set to console.log
  }
);

// Function to test connection and sync models
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    // Sync all defined models to the DB.
    // Creates tables if they don't exist. Does nothing if they exist.
    // Use { alter: true } or { force: true } cautiously during development if needed.
    //await sequelize.sync({ alter: true }); // Use alter:true to modify tables to match model (USE WITH CAUTION)

    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectToDatabase };
