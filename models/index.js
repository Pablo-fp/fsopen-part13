const Blog = require('./blog');
const User = require('./user');
const ReadingList = require('./readinglist');
const Session = require('./session');

// --- Define Associations ---

// Blog <-> User (Creator: One-to-Many)
// A User can create many Blogs
User.hasMany(Blog, { foreignKey: 'userId' });
// A Blog belongs to one User (the creator)
Blog.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // <-- Add this line with 'as: user'

// User <-> ReadingList (One-to-Many)
User.hasMany(ReadingList, { foreignKey: 'userId' });
ReadingList.belongsTo(User, { foreignKey: 'userId' });

// Blog <-> ReadingList (One-to-Many)
Blog.hasMany(ReadingList, { foreignKey: 'blogId' });
ReadingList.belongsTo(Blog, { foreignKey: 'blogId' });

// User <-> Blog (Reading List: Many-to-Many through ReadingList)
User.belongsToMany(Blog, {
  through: ReadingList,
  foreignKey: 'userId', // Key in ReadingList pointing to User
  otherKey: 'blogId', // Key in ReadingList pointing to Blog
  as: 'readings' // Alias for the association (Blogs in User's reading list)
});

Blog.belongsToMany(User, {
  through: ReadingList,
  foreignKey: 'blogId', // Key in ReadingList pointing to Blog
  otherKey: 'userId', // Key in ReadingList pointing to User
  as: 'usersMarked' // Alias for the association (Users who marked this blog)
});

// User <-> Session (One-to-Many)
User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = { Blog, User, ReadingList, Session };
