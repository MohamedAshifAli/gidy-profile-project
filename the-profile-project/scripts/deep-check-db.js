
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPaths = [
    path.join(process.cwd(), 'data', 'profile.db'),
    '/tmp/profile.db',
    path.join(process.cwd(), '.next', 'profile.db')
];

console.log('--- DB Check ---');
dbPaths.forEach(p => {
    if (fs.existsSync(p)) {
        console.log(`Checking: ${p}`);
        try {
            const db = new Database(p);
            const profiles = db.prepare('SELECT * FROM profiles').all();
            console.log(`Records in ${p}: ${profiles.length}`);
            if (profiles.length > 0) {
                console.log('Latest Profile Name:', profiles[0].name);
            }
            db.close();
        } catch (e) {
            console.log(`Error reading ${p}: ${e.message}`);
        }
    } else {
        console.log(`Not found: ${p}`);
    }
});
console.log('----------------');
