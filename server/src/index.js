require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  try {
    const [result] = await sql`SELECT version()`;
    const version = result?.version || 'No version found';
    res.send(`Hello World! - ${version}`);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.listen(8080, () => {
  console.log('server listening on port 8080');
});
