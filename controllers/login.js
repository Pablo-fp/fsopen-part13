// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\controllers\login.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  const user = await User.findOne({ where: { username } });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const userForToken = {
    id: user.id,
    username: user.username
  };

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' });
  res.status(200).json({ token, username: user.username, name: user.name });
});

module.exports = router;
