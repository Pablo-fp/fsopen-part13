// File: util/middleware.js
require('dotenv').config(); // To access process.env.SECRET
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust path if needed, for userFinder

/**
 * Middleware to extract JWT from the Authorization header (Bearer scheme).
 * It verifies the token and attaches the decoded payload (if valid)
 * to req.decodedToken.
 */
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization'); // e.g., "Bearer eyJhbGciOiJIUzI1..."

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      // Extract the token part after "Bearer "
      const token = authorization.substring(7);
      // Verify the token using the secret key
      // If verification fails (e.g., invalid signature, expired), it throws an error
      req.decodedToken = jwt.verify(token, process.env.SECRET);
      // req.decodedToken will now contain the payload, e.g., { username: 'user@example.com', id: 1, iat: ..., exp: ... }
    } catch (error) {
      // Errors like JsonWebTokenError, TokenExpiredError will be caught here
      console.error('Token verification failed:', error.message);
      // Clear potentially invalid decoded token if verification fails
      req.decodedToken = null;
      // NOTE: We don't send a 401 response here directly.
      // The route handler or subsequent middleware will decide if a token was required.
      // This allows public routes to still work even if an invalid token is sent.
      // The central error handler in index.js WILL catch JWT errors if they occur during verify.
    }
  } else {
    // No Authorization header or doesn't start with "Bearer "
    req.decodedToken = null;
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
const requireAuthCheck = (req, res, next) => {
  if (!req.decodedToken || !req.decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  // If using userFinder globally, you might also check:
  // if (!req.user) {
  //     return res.status(401).json({ error: 'Authentication required: User not found for token' });
  // }
  next();
};

module.exports = {
  tokenExtractor,
  userFinder, // Export if you decide to use it
  requireAuthCheck // Export if you use this specific check middleware
  // You could also move your errorHandler from index.js here and export it
};
