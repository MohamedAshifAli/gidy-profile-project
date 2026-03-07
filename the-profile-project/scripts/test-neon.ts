import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.DATABASE_URL!);

async function test() {
  console.log('Testing connection...');
  try {
    const res = await sql`SELECT 1 as result`;
    console.log('Success! Result:', res);
  } catch (err) {
    console.error('Failed!', err);
  }
}

test();
