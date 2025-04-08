// File: controllers/users.js
const router = require('express').Router();
const User = require('../models/user'); // Adjust path if needed

// POST /api/users - Add a new user
router.post('/', async (req, res) => {
  // Basic check for required fields before hitting the DB
  // Note: Sequelize validation will also catch this, but early checks can be clearer.
  const { name, username } = req.body;
  if (!name || !username) {
    return res
      .status(400)
      .json({ error: 'Name and username are required fields.' });
  }

  // Let express-async-errors handle potential errors from User.create
  // (like unique constraint violation or other validation errors)
  const newUser = await User.create({ name, username });
  console.log('Created user:', newUser.toJSON());
  // Timestamps (createdAt, updatedAt) are automatically set by Sequelize
  res.status(201).json(newUser);
});

// GET /api/users - List all users
router.get('/', async (req, res) => {
  // Let express-async-errors handle potential errors from User.findAll
  const users = await User.findAll();
  console.log('Fetched users:', JSON.stringify(users, null, 2));
  res.json(users);
});

// PUT /api/users/:username - Change a username
router.put('/:username', async (req, res) => {
  const targetUsername = req.params.username; // Username to find the user by
  const newUsername = req.body.username; // The new username from the request body

  // Validate the new username input
  if (
    !newUsername ||
    typeof newUsername !== 'string' ||
    newUsername.trim() === ''
  ) {
    return res.status(400).json({
      error:
        'New username must be provided in the request body and cannot be empty.'
    });
  }

  // Find the user by their current username
  const user = await User.findOne({ where: { username: targetUsername } });

  if (user) {
    // Update the username
    user.username = newUsername.trim(); // Trim whitespace just in case

    // Let express-async-errors handle potential errors from user.save()
    // (like unique constraint violation if the new username already exists)
    await user.save(); // This will automatically update the 'updatedAt' timestamp

    console.log(
      `Updated username for user ID ${user.id} from ${targetUsername} to ${newUsername}`
    );
    console.log('Updated user:', user.toJSON());
    res.json(user); // Respond with the updated user object
  } else {
    // If the user with the target username wasn't found
    res
      .status(404)
      .json({ error: `User with username '${targetUsername}' not found.` });
  }
});

module.exports = router;
