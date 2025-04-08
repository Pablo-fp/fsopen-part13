// File: index.js
require('dotenv').config();
// NO require('express-async-errors'); needed here for Express 5
const express = require('express');
const { connectToDatabase } = require('./util/db');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users'); // <-- Import users router
require('./models/blog'); // Ensure models are registered before sync
require('./models/user'); // <-- Import user model

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Mount routers
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter); // <-- Mount users router

app.get('/', (req, res) => {
  res.send('Blog Application API is running!');
});

// Centralized Error Handling Middleware (remains the same)
const errorHandler = (error, req, res, next) => {
  console.error('ERROR:', error.name, '-', error.message);

  if (error.name === 'SequelizeValidationError') {
    // Extract specific validation messages for better client feedback
    const messages = error.errors.map((err) => err.message).join('. ');
    return res.status(400).json({ error: `Validation failed: ${messages}` });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    const messages = error.errors
      .map((e) => `${e.path} must be unique`)
      .join('. ');
    return res.status(400).json({ error: `Conflict: ${messages}` });
  }
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

// Server Start Logic (remains the same)
const start = async () => {
  await connectToDatabase(); // This now also handles sequelize.sync()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
