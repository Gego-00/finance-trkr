import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Only connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error acquiring client', err.stack);
    } else {
      console.log('Database connected successfully');
      release();
    }
  });
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    const shortText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    console.log(`Query executed in ${duration}ms (${res.rowCount} rows): ${shortText.split('\n')[0]}`);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query was:', text);
    if (params) console.error('Params:', params);
    throw error;
  }
};

export default pool;
