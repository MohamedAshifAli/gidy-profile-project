import { Pool } from 'pg';

// Standard PostgreSQL pool for best performance and stability
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

/**
 * A helper function to run SQL queries in an async way
 * Compatible with Neon's sql template literal or standard arrays.
 */
export async function sql(text: any, ...values: any[]) {
  // If called as a template literal: sql`SELECT * FROM ... WHERE id = ${id}`
  if (Array.isArray(text)) {
    // text is the fragments, values are the placeholders
    let query = '';
    for (let i = 0; i < text.length; i++) {
       query += text[i] + (i < values.length ? '$' + (i + 1) : '');
    }
    const res = await pool.query(query, values);
    return res.rows;
  }
  
  // If called as a standard function: sql('SELECT...', [...])
  const res = await pool.query(text, values);
  return res.rows;
}

export default sql;
