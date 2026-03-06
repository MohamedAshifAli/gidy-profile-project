// ============================
// Database Connection & Schema
// ============================
import Database from 'better-sqlite3';
import path from 'path';

// Use an absolute path based on the directory of this file to ensure consistency
// across different processes (Next.js vs. Express)
const rootDir = path.resolve(process.cwd());
let DB_PATH = path.join(rootDir, 'data', 'profile.db');

// In serverless environments like Vercel/Netlify, the filesystem is read-only
// except for the /tmp directory.
if (process.env.VERCEL || process.env.NETLIFY || (process.env.NODE_ENV === 'production' && !fs.existsSync(path.join(rootDir, 'data')))) {
  DB_PATH = '/tmp/profile.db';
}

// Ensure the data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create data directory, falling back to /tmp', err);
  DB_PATH = '/tmp/profile.db';
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const database = db;

  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one profile row exists
      name TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      profile_picture TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      proficiency INTEGER NOT NULL DEFAULT 50,
      endorsement_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS endorsements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id INTEGER NOT NULL,
      endorser_name TEXT NOT NULL,
      endorser_avatar TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS work_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_current INTEGER NOT NULL DEFAULT 0,
      logo TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL DEFAULT ''
    );
  `);

  // Seed default data if empty
  const count = database.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
  if (count.count === 0) {
    seedDatabase(database);
  }
}

function seedDatabase(database: Database.Database) {
  // Insert a single empty profile with fixed ID 1
  database.prepare(`
    INSERT OR IGNORE INTO profiles (id, name, title, bio, email, phone, location, profile_picture, cover_image)
    VALUES (1, '', '', '', '', '', '', '', '')
  `).run();

  // Insert default settings
  database.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`).run('theme', 'light');
}

export default getDb;
