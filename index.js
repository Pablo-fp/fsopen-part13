// File: index.js
require('dotenv').config();
const express = require('express');
const { connectToDatabase } = require('./util/db');
const { tokenExtractor, userFinder } = require('./util/middleware'); // <-- Import middleware
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login'); // <-- Import login router
require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// --- Apply Token Extractor Globally (or selectively before protected routes) ---
// This makes req.decodedToken available (if token exists) on ALL subsequent routes
app.use(tokenExtractor);
// Optional: Apply userFinder globally if most routes need req.user
// app.use(userFinder);

// --- Mount Routers ---
app.use('/api/login', loginRouter); // Login doesn't need token check
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

app.get('/', (req, res) => {
  res.send('Blog Application API is running!');
});

// Centralized Error Handling Middleware
const errorHandler = (error, req, res, next) => {
  console.error('ERROR:', error.name, '-', error.message);

  // Handle JWT Errors specifically
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Existing handlers
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map((err) => err.message);
    return res.status(400).json({ error: messages });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    const messages = error.errors
      .map((e) => `${e.path} must be unique`)
      .join('. ');
    return res.status(400).json({ error: `Conflict: ${messages}` });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    // Handle FK errors
    console.error('FK Constraint Error Details:', error);
    return res.status(400).json({ error: 'Invalid reference to related data' }); // e.g., invalid userId
  }
  if (error.name === 'SequelizeDatabaseError') {
    console.error('DB Error Details:', error);
    return res.status(500).json({ error: 'A database error occurred' });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  // Generic fallback
  return res
    .status(500)
    .json({ error: 'An unexpected internal server error occurred' });
};
app.use(errorHandler);

// Server Start Logic
const start = async () => {
  await connectToDatabase(); // Handles sync/alter
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
