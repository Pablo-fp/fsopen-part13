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

// Basic Error Handling Middleware (Add this AFTER your routes)
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  console.error('ERROR HANDLER:', error.message); // Log the error message

  // Handle specific known errors or provide a generic response
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).send({ error: error.message });
  } else if (error.name === 'SequelizeDatabaseError') {
    // Log more details for database errors if needed, but send generic message
    console.error('DB Error Details:', error);
    return res.status(500).send({ error: 'Database error occurred' });
  }

  // Generic internal server error for unhandled cases
  return res.status(500).send({ error: 'Something went wrong!' });
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
