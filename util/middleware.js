// File: util/middleware.js
require('dotenv').config(); // To access process.env.SECRET
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Session = require('../models/session');

/**
 * Middleware to extract JWT from the Authorization header (Bearer scheme).
 * It verifies the token and attaches the decoded payload (if valid)
 * to req.decodedToken.
 */
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization'); // e.g., "Bearer eyJhbGciOiJIUzI1..."
  req.decodedToken = null; // Initialize
  req.tokenString = null; // Initialize raw token string

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.tokenString = authorization.substring(7);
      req.decodedToken = jwt.verify(req.tokenString, process.env.SECRET);
    } catch (error) {
      console.error('Token verification failed:', error.message);
    }
  }
  next(); // Proceed to the next middleware or route handler
};

/**
 * Optional Middleware: Finds the user associated with the token ID.
 * If a valid decoded token exists (from tokenExtractor), this fetches
 * the corresponding user from the database and attaches it to req.user.
 * Helps verify the user still exists and makes user object easily accessible.
 */
const userFinder = async (req, res, next) => {
  // Check if tokenExtractor successfully decoded a token with an ID
  if (req.decodedToken && req.decodedToken.id) {
    // Find the user by primary key (ID from token)
    // Default scope excludes password hash, which is good here
    req.user = await User.findByPk(req.decodedToken.id);

    if (!req.user) {
      // User specified in token no longer exists in the database.
      // Treat this as an invalid token situation.
      console.warn(
        `User ID ${req.decodedToken.id} from token not found in DB.`
      );
      // Optionally send 401 immediately, or let route handlers check req.user
      // Sending 401 here ensures invalid sessions are terminated early.
      return res
        .status(401)
        .json({ error: 'User associated with token not found' });
    }
    // req.user now contains the Sequelize User instance
  } else {
    // No valid token was decoded, or it didn't contain an ID.
    req.user = null;
  }
  next(); // Proceed
};

// Example of a specific "require authentication" middleware if not using userFinder globally
// or if you want finer control per route group.
const requireAuthCheck = async (req, res, next) => {
  // 1. Check if token was extracted and decoded successfully
  if (!req.decodedToken || !req.decodedToken.id) {
    return res
      .status(401)
      .json({ error: 'Token missing or invalid signature' });
  }

  // 2. Check if the token corresponds to an active session in the DB
  const session = await Session.findOne({
    where: {
      token: req.tokenString // Check against the raw token string
    }
  });

  if (!session) {
    return res
      .status(401)
      .json({ error: 'Session expired or invalid. Please log in again.' });
  }

  // 3. Check if the user associated with the token/session is disabled
  // We need to fetch the user including the 'disabled' field
  const user = await User.findByPk(req.decodedToken.id, {
    attributes: ['id', 'disabled'] // Only fetch necessary fields
  });

  if (!user) {
    // Should ideally not happen if session exists, but good safety check
    await session.destroy(); // Clean up orphaned session
    return res
      .status(401)
      .json({ error: 'User associated with token not found' });
  }

  if (user.disabled) {
    // User is disabled, invalidate the session and deny access
    await session.destroy(); // Log out the disabled user by removing the session
    return res.status(403).json({ error: 'Account disabled' });
  }

  // If all checks pass, attach user ID and proceed
  req.userId = user.id; // Attach user ID for convenience in route handlers if needed
  next();
};

module.exports = {
  tokenExtractor,
  userFinder, // Export if you decide to use it
  requireAuthCheck // Export if you use this specific check middleware
  // You could also move your errorHandler from index.js here and export it
};
