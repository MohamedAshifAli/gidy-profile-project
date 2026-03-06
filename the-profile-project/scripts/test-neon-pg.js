const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    console.log('Testing connection with standard pg driver...');
    try {
        await client.connect();
        const res = await client.query('SELECT 1 as result');
        console.log('Success! Result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Failed!', err);
    }
}

test();
