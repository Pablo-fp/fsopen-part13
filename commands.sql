-- File: commands.sql
-- Description: SQL commands for PostgreSQL to create the blogs table and add initial data.

-- Optional: Drop the table if it already exists to allow rerunning the script cleanly.
DROP TABLE IF EXISTS blogs;

-- Create the blogs table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,          -- PostgreSQL specific auto-incrementing integer primary key
    author TEXT,                    -- Author's name (nullable)
    url TEXT NOT NULL,              -- Blog post URL (cannot be null)
    title TEXT NOT NULL,            -- Blog post title (cannot be null)
    likes INTEGER DEFAULT 0 NOT NULL -- Number of likes, defaults to 0, cannot be null
);

-- Insert the first blog post
-- Note: We don't specify 'id' (it's auto-generated) or 'likes' (it defaults to 0)
INSERT INTO blogs (author, url, title) VALUES (
    'Dan Abramov',
    'https://overreacted.io/the-wet-codebase/',
    'The WET Codebase'
);

-- Insert the second blog post
INSERT INTO blogs (author, url, title) VALUES (
    'Martin Fowler',
    'https://martinfowler.com/articles/is-quality-worth-cost.html',
    'Is High Quality Software Worth the Cost?'
);

-- Insert a third blog post (just to show another example)
INSERT INTO blogs (author, url, title, likes) VALUES (
    'Robert C. Martin',
    'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    'Type Wars',
    5 -- Example of explicitly setting likes
);


-- Optional: Command to verify the contents of the table after creation/insertion
-- SELECT * FROM blogs;