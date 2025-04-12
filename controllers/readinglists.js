// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\controllers\readinglists.js
const router = require('express').Router();
const { ReadingList } = require('../models');
const { requireAuthCheck } = require('../util/middleware');

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

// PUT /api/readinglists/:id - Mark a reading list entry as read/unread
router.put('/:id', requireAuthCheck, async (req, res, next) => {
  // requireAuthCheck ensures req.decodedToken exists
  try {
    const readingListId = req.params.id;
    const userIdFromToken = req.decodedToken.id;
    const readStatus = req.body.read; // Expecting { "read": true } or { "read": false }

    // Validate input
    if (typeof readStatus !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid "read" field (must be boolean).' });
    }

    // Find the specific reading list entry
    const readingEntry = await ReadingList.findByPk(readingListId);

    if (!readingEntry) {
      return res.status(404).json({
        error: `Reading list entry with id ${readingListId} not found`
      });
    }

    // Check if the logged-in user owns this reading list entry
    if (readingEntry.userId !== userIdFromToken) {
      return res.status(403).json({
        error: 'Forbidden: You can only modify your own reading list entries'
      });
    }

    // Update the read status and save
    readingEntry.read = readStatus;

    await readingEntry.save();

    console.log(
      `User ${userIdFromToken} updated read status for reading list entry ${readingListId} to ${readStatus}`
    );
    res.json(readingEntry); // Return the updated entry
  } catch (error) {
    next(error); // Pass errors to the centralized handler
  }
});

module.exports = router;
