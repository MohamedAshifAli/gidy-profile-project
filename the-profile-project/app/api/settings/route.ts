// ============================
// Settings API Route  
// GET /api/settings - Get all settings (theme, etc.)
// PUT /api/settings - Update a setting
// ============================
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
    ).run(key, value, value);

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
