// filepath: c:\Users\pablo\Desktop\FSOPEN\fsopen-part13\models\index.js
const Blog = require('./blog');
const User = require('./user');

// Set up associations
User.hasMany(Blog, { foreignKey: 'userId' });
Blog.belongsTo(User, { foreignKey: 'userId' });

module.exports = { Blog, User };
