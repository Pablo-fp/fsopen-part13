// File: controllers/blogs.js
const router = require('express').Router();
const { Blog, User } = require('../models'); // Assuming index.js in models exports all
// Or: const Blog = require('../models/blog'); const User = require('../models/user');

// Middleware specifically for routes needing authenticated user
const requireAuth = (req, res, next) => {
  if (!req.decodedToken || !req.decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  // Optional: Check if req.user exists if using userFinder middleware globally
  // if (!req.user) {
  //     return res.status(401).json({ error: 'User not found for token' });
  // }
  next();
};

// GET /api/blogs - List all blogs (Include User Info)
router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    include: {
      // Eager load the associated User
      model: User,
      attributes: ['name', 'username'] // Select only specific user fields
    },
    order: [
      // Optional: Order blogs, e.g., by likes descending
      ['likes', 'DESC']
    ]
  });
  res.json(blogs);
});

// POST /api/blogs - Add a new blog (Protected Route)
router.post('/', requireAuth, async (req, res) => {
  // <-- Apply requireAuth middleware
  const { author, url, title, likes } = req.body;

  if (!url || !title) {
    return res
      .status(400)
      .json({ error: 'URL and Title are required fields.' });
  }

  // Get user ID from the verified token payload
  const userId = req.decodedToken.id;

  // Create the blog and associate it with the user
  const newBlog = await Blog.create({
    author: author || null, // Allow author to be optional if desired
    url,
    title,
    likes: likes || 0, // Default likes if not provided
    userId: userId // <-- Associate with the logged-in user
  });

  // Fetch the created blog again including the user details to return
  const blogToReturn = await Blog.findByPk(newBlog.id, {
    include: {
      model: User,
      attributes: ['name', 'username']
    }
  });

  console.log('Created blog:', blogToReturn.toJSON());
  res.status(201).json(blogToReturn);
});

// GET /api/blogs/:id - Get a single blog (Include User Info)
router.get('/:id', async (req, res) => {
  const blog = await Blog.findByPk(req.params.id, {
    include: {
      model: User,
      attributes: ['name', 'username']
    }
  });
  if (blog) {
    res.json(blog);
  } else {
    res.status(404).json({ error: `Blog with id ${req.params.id} not found` });
  }
});

// DELETE /api/blogs/:id - Delete a blog (Protected - only owner should delete)
router.delete('/:id', requireAuth, async (req, res) => {
  // <-- Apply requireAuth
  const blogId = req.params.id;
  const userId = req.decodedToken.id; // ID of the user making the request

  const blog = await Blog.findByPk(blogId);

  if (!blog) {
    return res.status(404).json({ error: `Blog with id ${blogId} not found` });
  }

  // Check if the logged-in user is the owner of the blog
  if (blog.userId !== userId) {
    return res
      .status(403)
      .json({ error: 'Forbidden: You can only delete your own blogs' });
  }

  // If owner, proceed with deletion
  await blog.destroy();
  console.log(`User ${userId} deleted blog ${blogId}`);
  res.status(204).end();
});

// PUT /api/blogs/:id - Update likes (Can be done by anyone logged in, or check ownership)
// For simplicity, let's allow any logged-in user to update likes for now.
// If only owner should update, add ownership check similar to DELETE.
router.put('/:id', requireAuth, async (req, res) => {
  // <-- Apply requireAuth
  const blogId = req.params.id;
  const newLikes = req.body.likes;

  if (
    newLikes === undefined ||
    typeof newLikes !== 'number' ||
    !Number.isInteger(newLikes) ||
    newLikes < 0
  ) {
    return res.status(400).json({
      error:
        'Missing or invalid "likes" field (must be a non-negative integer).'
    });
  }

  const blog = await Blog.findByPk(blogId);

  if (blog) {
    blog.likes = newLikes;
    await blog.save();

    // Fetch again including user details
    const updatedBlog = await Blog.findByPk(blog.id, {
      include: {
        model: User,
        attributes: ['name', 'username']
      }
    });

    console.log(
      `User ${req.decodedToken.id} updated likes for blog ${blogId} to ${newLikes}`
    );
    res.json(updatedBlog);
  } else {
    res.status(404).json({ error: `Blog with id ${blogId} not found` });
  }
});

module.exports = router;
