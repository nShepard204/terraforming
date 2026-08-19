import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  pipeline: true,
});

export async function query(text, params) {
  return pool.query(text, params);
}
