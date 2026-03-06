
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'profile.db');
const db = new Database(dbPath);
const profiles = db.prepare('SELECT * FROM profiles').all();
console.log('Profiles:', JSON.stringify(profiles, null, 2));
const settings = db.prepare('SELECT * FROM settings').all();
console.log('Settings:', JSON.stringify(settings, null, 2));
db.close();
