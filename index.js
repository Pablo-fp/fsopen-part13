// File: index.js
require('dotenv').config();
const express = require('express');
const { connectToDatabase } = require('./util/db'); // Import connection function
const blogsRouter = require('./controllers/blogs'); // Import blog routes
require('./models/blog'); // Import model to ensure Sequelize knows about it

const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default 3001

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount the blogs router under the /api/blogs path
app.use('/api/blogs', blogsRouter);

// Simple root route for testing server status
app.get('/', (req, res) => {
  res.send('Blog Application API is running!');
});

// --- Centralized Error Handling Middleware ---
// This MUST come AFTER your routes
const errorHandler = (error, req, res, next) => {
  console.error('ERROR:', error.name, '-', error.message); // Log error details for debugging

  // ... (rest of your errorHandler logic remains the same) ...
  // Handle SequelizeValidationErrors, DatabaseErrors, etc.

  if (error.name === 'SequelizeValidationError') {
    return res
      .status(400)
      .json({ error: 'Validation failed: ' + error.message });
  }
  // ... other specific error checks ...
  if (error.name === 'SequelizeDatabaseError') {
    console.error('DB Error Details:', error);
    return res.status(500).json({ error: 'A database error occurred' });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  return res
    .status(500)
    .json({ error: 'An unexpected internal server error occurred' });
};

app.use(errorHandler);

// Function to start the server after connecting to DB
const start = async () => {
  await connectToDatabase(); // Ensure DB connection before starting server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start the application
start();
