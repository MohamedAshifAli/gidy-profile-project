// ============================
// Database Connection & Schema
// ============================
import Database from 'better-sqlite3';
import path from 'path';

let DB_PATH = path.join(process.cwd(), 'data', 'profile.db');

// In serverless environments like Vercel/Netlify, the filesystem is read-only
// except for the /tmp directory.
if (process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === 'production') {
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  // Insert default profile
  const insertProfile = database.prepare(`
    INSERT INTO profiles (name, title, bio, email, phone, location, profile_picture, cover_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertProfile.run(
    'Mohamed Ashif Ali',
    'Python / AI Engineer ',
    'Passionate developer with 6+ years of experience building scalable web applications. I love crafting beautiful user interfaces and solving complex backend challenges. Currently focused on React, Node.js, and cloud-native architectures. When not coding, you can find me mentoring junior developers or contributing to open-source projects.',
    'mohameashif180@email.com',
    '+91 63829 47757',
    'Velacherry, Chennai, India',
    '',
    ''
  );

  const profileId = result.lastInsertRowid;

  // Insert social links
  const insertSocialLink = database.prepare(`
    INSERT INTO social_links (profile_id, platform, url, icon)
    VALUES (?, ?, ?, ?)
  `);

  const socialLinks = [
    [profileId, 'GitHub', 'https://github.com/MohamedAshifAli/gidy-profile-project', 'github'],
    [profileId, 'LinkedIn', 'https://www.linkedin.com/in/mohamed-ashif-8ba805204/', 'linkedin'],
    [profileId, 'Twitter', 'https://gidy-profile-project-ashif.vercel.app/', 'Vercel'],
    [profileId, 'Portfolio', 'https://sarahchen.dev', 'globe'],
    [profileId, 'Dribbble', 'https://dribbble.com/sarahchen', 'dribbble'],
  ];

  for (const link of socialLinks) {
    insertSocialLink.run(...link);
  }

  // Insert skills
  const insertSkill = database.prepare(`
    INSERT INTO skills (profile_id, name, category, proficiency, endorsement_count)
    VALUES (?, ?, ?, ?, ?)
  `);

  const skills = [
    [profileId, 'React', 'Frontend', 95, 24],
    [profileId, 'TypeScript', 'Frontend', 92, 19],
    [profileId, 'Next.js', 'Frontend', 90, 15],
    [profileId, 'Node.js', 'Backend', 88, 21],
    [profileId, 'Python', 'Backend', 82, 12],
    [profileId, 'PostgreSQL', 'Database', 85, 10],
    [profileId, 'GraphQL', 'Backend', 80, 8],
    [profileId, 'AWS', 'DevOps', 78, 14],
    [profileId, 'Docker', 'DevOps', 83, 11],
    [profileId, 'Figma', 'Design', 75, 7],
    [profileId, 'CSS/SASS', 'Frontend', 93, 16],
    [profileId, 'MongoDB', 'Database', 79, 9],
  ];

  for (const skill of skills) {
    insertSkill.run(...skill);
  }

  // Insert endorsements for some skills
  const insertEndorsement = database.prepare(`
    INSERT INTO endorsements (skill_id, endorser_name, endorser_avatar)
    VALUES (?, ?, ?)
  `);

  const endorsers = [
    'Alex Rivera', 'Jordan Kim', 'Morgan Taylor', 'Casey Johnson',
    'Riley Martinez', 'Quinn Brown', 'Avery Williams', 'Blake Davis',
  ];

  // Add endorsements to first few skills
  const skillRows = database.prepare('SELECT id FROM skills WHERE profile_id = ?').all(profileId) as { id: number }[];
  for (let i = 0; i < Math.min(5, skillRows.length); i++) {
    const numEndorsements = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < numEndorsements; j++) {
      insertEndorsement.run(skillRows[i].id, endorsers[j], '');
    }
  }

  // Insert work experience
  const insertWork = database.prepare(`
    INSERT INTO work_experience (profile_id, company, role, description, start_date, end_date, is_current, logo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const workExperience = [
    [profileId, 'TechFlow Inc.', 'Senior Full-Stack Developer', 'Leading the frontend architecture for a SaaS platform serving 50K+ users. Implemented micro-frontend architecture reducing build times by 60%. Mentoring a team of 4 junior developers.', '2022-03', null, 1, ''],
    [profileId, 'DataVista Labs', 'Full-Stack Developer', 'Built real-time data visualization dashboards using React and D3.js. Developed RESTful APIs handling 10K+ requests/minute. Reduced page load times by 40% through performance optimization.', '2020-06', '2022-02', 0, ''],
    [profileId, 'StartupHub', 'Frontend Developer', 'Developed responsive web applications for early-stage startups. Implemented CI/CD pipelines and automated testing. Collaborated with designers to create pixel-perfect UIs.', '2019-01', '2020-05', 0, ''],
    [profileId, 'FreelanceWork', 'Freelance Web Developer', 'Delivered 20+ client projects ranging from portfolio sites to e-commerce platforms. Built custom WordPress themes and React applications.', '2017-06', '2018-12', 0, ''],
  ];

  for (const work of workExperience) {
    insertWork.run(...work);
  }

  // Insert default settings
  const insertSetting = database.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);
  insertSetting.run('theme', 'light');
}

export default getDb;
