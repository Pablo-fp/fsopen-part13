// File: controllers/blogs.js
const router = require('express').Router();
const Blog = require('../models/blog'); // Adjust path if needed

// GET /api/blogs - List all blogs
router.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.findAll();
    console.log('Fetched blogs:', JSON.stringify(blogs, null, 2)); // Log fetched blogs
    res.json(blogs);
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

// GET /api/blogs/:id - Get a single blog
router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const blog = await Blog.findByPk(id);
    if (blog) {
      console.log('Found blog:', blog.toJSON());
      res.json(blog);
    } else {
      res.status(404).json({ error: `Blog with id ${id} not found` });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/blogs - Add a new blog
router.post('/', async (req, res, next) => {
  try {
    // Basic validation: Check if required fields are present
    const { author, url, title, likes } = req.body;
    if (!url || !title) {
      return res
        .status(400)
        .json({ error: 'URL and Title are required fields.' });
    }

    // Create blog using request body data
    // Sequelize automatically maps matching keys (author, url, title, likes)
    const newBlog = await Blog.create(req.body);
    console.log('Created blog:', newBlog.toJSON()); // Log created blog
    res.status(201).json(newBlog); // Respond with the newly created blog and 201 status
  } catch (error) {
    // Handle potential validation errors from Sequelize or other DB errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    // Pass other errors to the generic error handler
    next(error);
  }
});

// DELETE /api/blogs/:id - Delete a blog
router.delete('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const blog = await Blog.findByPk(id); // Find blog by primary key

    if (blog) {
      await blog.destroy(); // Delete the blog instance
      console.log(`Deleted blog with id: ${id}`);
      res.status(204).end(); // Send 204 No Content on successful deletion
    } else {
      res.status(404).json({ error: `Blog with id ${id} not found` }); // Send 404 if not found
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

// PUT /api/blogs/:id - Update the like count of a blog
router.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const newLikes = req.body.likes; // Get the new like count from the request body

  // Validate input: check if 'likes' is provided and is a number
  if (
    newLikes === undefined ||
    typeof newLikes !== 'number' ||
    !Number.isInteger(newLikes) ||
    newLikes < 0
  ) {
    return res
      .status(400)
      .json({
        error:
          'Missing or invalid "likes" field in request body. It must be a non-negative integer.'
      });
  }

  try {
    // Find the blog by its primary key
    const blog = await Blog.findByPk(id);

    if (blog) {
      // If the blog exists, update its 'likes' property
      blog.likes = newLikes;
      // Save the changes back to the database
      await blog.save();

      console.log(`Updated likes for blog ${id} to ${newLikes}`);
      // Respond with the updated blog object
      res.json(blog);
    } else {
      // If the blog doesn't exist, return a 404 Not Found status
      res.status(404).json({ error: `Blog with id ${id} not found` });
    }
  } catch (error) {
    // Pass any other errors (like database errors) to the error handling middleware
    next(error);
  }
});

module.exports = router;
