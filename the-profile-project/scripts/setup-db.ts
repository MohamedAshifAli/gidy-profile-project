import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local manually if needed (not usually needed in development with next)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

const sql = neon(DATABASE_URL);

async function setup() {
  console.log('--- Setting up Neon Database ---');
  try {
    // 1. Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        profile_picture TEXT NOT NULL DEFAULT '',
        cover_image TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Profiles table ready.');

    // 2. Ensuring the single profile row exists
    await sql`
      INSERT INTO profiles (id) VALUES (1)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✓ Single profile row established.');

    // 3. Social Links
    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT ''
      )
    `;
    console.log('✓ Social Links table ready.');

    // 4. Skills
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General',
        proficiency INTEGER NOT NULL DEFAULT 50,
        endorsement_count INTEGER NOT NULL DEFAULT 0
      )
    `;
    console.log('✓ Skills table ready.');

    // 5. Endorsements
    await sql`
      CREATE TABLE IF NOT EXISTS endorsements (
        id SERIAL PRIMARY KEY,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        endorser_name TEXT NOT NULL,
        endorser_avatar TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Endorsements table ready.');

    // 6. Work Experience
    await sql`
      CREATE TABLE IF NOT EXISTS work_experience (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_current BOOLEAN NOT NULL DEFAULT FALSE,
        logo TEXT NOT NULL DEFAULT ''
      )
    `;
    console.log('✓ Work Experience table ready.');

    // 7. Settings
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL DEFAULT ''
      )
    `;
    console.log('✓ Settings table ready.');

    await sql`
      INSERT INTO settings (key, value) VALUES ('theme', 'light')
      ON CONFLICT (key) DO NOTHING
    `;
    console.log('✓ Default settings established.');

    console.log('--- Database Setup Completed Successfully ---');
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setup();
