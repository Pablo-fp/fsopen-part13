// File: cli.js
// Description: Connects to the PostgreSQL database and prints blog entries.

// Load environment variables from .env file
require('dotenv').config();

// Import the Pool class from the 'pg' library
const { Pool } = require('pg');

// Create a new Pool instance for managing connections
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

// Define an async function to fetch and print blogs
async function printBlogs() {
  console.log('Connecting to database...'); // Optional log
  let client; // Declare client outside try block for access in finally

  try {
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connected successfully!'); // Optional log

    // Define the SQL query
    const sql = 'SELECT * FROM blogs;';
    console.log(`Executing: ${sql}`); // Log the query being executed

    // Execute the query
    const result = await client.query(sql);

    // Check if we got any results
    if (result.rows.length === 0) {
      console.log('No blogs found in the database.');
    } else {
      console.log('\n--- Blogs ---');
      // Iterate over the rows returned from the database
      result.rows.forEach((blog) => {
        // Print each blog in the specified format
        console.log(
          `${blog.author || 'Unknown Author'}: '${blog.title}', ${
            blog.likes
          } likes`
        );
      });
      console.log('-------------\n');
    }
  } catch (err) {
    // Log any errors that occur during connection or query execution
    console.error(
      'Error executing query or connecting to database:',
      err.stack
    );
  } finally {
    // IMPORTANT: Release the client back to the pool
    // This ensures the connection is available for reuse or closed cleanly.
    if (client) {
      client.release();
      console.log('Database client released.'); // Optional log
    }
    // Close the entire pool when the script is done
    // This allows the Node.js process to exit gracefully.
    await pool.end();
    console.log('Connection pool closed.'); // Optional log
  }
}

// Call the main function to start the process
printBlogs();
