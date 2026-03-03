// ============================
// Skills API Route
// POST /api/skills - Add a new skill
// DELETE /api/skills - Delete a skill
// ============================
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, category, proficiency } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number } | undefined;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = db.prepare(
      'INSERT INTO skills (profile_id, name, category, proficiency, endorsement_count) VALUES (?, ?, ?, ?, 0)'
    ).run(profile.id, name, category, proficiency || 50);

    const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error('Error adding skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM endorsements WHERE skill_id = ?').run(Number(id));
    db.prepare('DELETE FROM skills WHERE id = ?').run(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
