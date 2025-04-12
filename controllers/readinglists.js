// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\controllers\readinglists.js
const router = require('express').Router();
const { ReadingList } = require('../models'); // Assuming models/index.js exports it

// POST /api/readinglists - Add a blog to a user's reading list
router.post('/', async (req, res, next) => {
  try {
    const { userId, blogId } = req.body;

    if (!userId || !blogId) {
      return res.status(400).json({ error: 'userId and blogId are required' });
    }

    // Optional: Add checks to ensure user and blog exist before creating entry
    // const userExists = await User.findByPk(userId);
    // const blogExists = await Blog.findByPk(blogId);
    // if (!userExists || !blogExists) {
    //   return res.status(404).json({ error: 'User or Blog not found' });
    // }

    const readingEntry = await ReadingList.create({ userId, blogId });
    res.status(201).json(readingEntry);
  } catch (error) {
    // Handle potential unique constraint errors if the pair already exists
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(409)
        .json({ error: 'Blog already in reading list for this user' });
    }
    next(error); // Pass other errors to the centralized handler
  }
});

module.exports = router;
