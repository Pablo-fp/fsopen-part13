// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\controllers\login.js
require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const { User, Session } = require('../models');

router.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const user = await User.scope('withPassword').findOne({
      where: { username: username }
    });

    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if user is disabled BEFORE issuing token/session
    if (user.disabled) {
      return res
        .status(403)
        .json({ error: 'Account disabled, please contact admin' });
    }

    const userForToken = {
      id: user.id,
      username: user.username
    };

    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: '1h'
    });

    // Store the session in the database
    await Session.create({ userId: user.id, token: token });

    // Return token and user info (excluding password and disabled status)
    res.status(200).json({ token, username: user.username, name: user.name });
  } catch (error) {
    next(error); // Pass any errors to the centralized error handler
  }
});

// Add DELETE /api/logout route
router.delete('/logout', async (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    let token = null;

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      token = authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // Find and delete the session based on the token
    const deletedSessionCount = await Session.destroy({
      where: { token: token }
    });

    if (deletedSessionCount > 0) {
      console.log(
        `User logged out, session deleted for token: ...${token.slice(-6)}`
      );
      res.status(204).end(); // Success, no content
    } else {
      // Token was provided but didn't match an active session
      // This could happen if the session was already deleted or never existed
      res
        .status(404)
        .json({ error: 'Session not found or already terminated' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
