// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\controllers\users.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User, Blog } = require('../models'); // Adjust path if needed

// POST /api/users - Add a new user
router.post('/', async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ error: 'Name, username and password are required fields.' });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 3 characters long.' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = await User.create({ name, username, passwordHash });
  console.log('Created user:', newUser.toJSON());
  res.status(201).json(newUser);
});

// GET /api/users - List all users including their blogs
router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: ['id', 'title', 'author', 'url', 'likes']
    }
  });
  console.log('Fetched users:', JSON.stringify(users, null, 2));
  res.json(users);
});

// PUT /api/users/:username - Change a username
router.put('/:username', async (req, res) => {
  const targetUsername = req.params.username;
  const newUsername = req.body.username;

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

  const user = await User.findOne({ where: { username: targetUsername } });

  if (user) {
    user.username = newUsername.trim();
    await user.save();
    console.log(
      `Updated username for user ID ${user.id} from ${targetUsername} to ${newUsername}`
    );
    console.log('Updated user:', user.toJSON());
    res.json(user);
  } else {
    res
      .status(404)
      .json({ error: `User with username '${targetUsername}' not found.` });
  }
});

module.exports = router;
