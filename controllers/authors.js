const router = require('express').Router();
const { Blog } = require('../models');
const { sequelize } = require('../util/db');

router.get('/', async (req, res) => {
  try {
    const authorsData = await Blog.findAll({
      attributes: [
        'author',
        [sequelize.fn('COUNT', sequelize.col('id')), 'articles'],
        [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
      ],
      group: ['author'],
      order: [[sequelize.fn('SUM', sequelize.col('likes')), 'DESC']]
    });
    res.json(authorsData);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Error fetching authors' });
  }
});

module.exports = router;
