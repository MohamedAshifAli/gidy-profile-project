import { neon } from '@neondatabase/serverless';

// Ensure DATABASE_URL is available
// Use a dummy connection string if DATABASE_URL is missing to prevent initialization crashes during build
// In actual execution (API routes/Backend), DATABASE_URL must be provided
const connectionString = process.env.DATABASE_URL || 'postgres://placeholder_user:placeholder_password@placeholder_host:5432/placeholder_db';

/**
 * Neon Database Client
 * Supports tagged template literals: await sql`SELECT * FROM table WHERE id = ${id}`
 */
const sql = neon(connectionString);

export default sql;
