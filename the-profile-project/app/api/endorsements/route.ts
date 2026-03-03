// ============================
// Endorsements API Route
// POST /api/endorsements - Endorse a skill
// ============================
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { skill_id, endorser_name, endorser_avatar } = body;

    if (!skill_id || !endorser_name) {
      return NextResponse.json(
        { error: 'Skill ID and endorser name are required' },
        { status: 400 }
      );
    }

    // Check if this endorser already endorsed this skill
    const existing = db.prepare(
      'SELECT id FROM endorsements WHERE skill_id = ? AND endorser_name = ?'
    ).get(skill_id, endorser_name);

    if (existing) {
      return NextResponse.json(
        { error: 'You have already endorsed this skill' },
        { status: 409 }
      );
    }

    // Add endorsement
    db.prepare(
      'INSERT INTO endorsements (skill_id, endorser_name, endorser_avatar) VALUES (?, ?, ?)'
    ).run(skill_id, endorser_name, endorser_avatar || '');

    // Update endorsement count
    db.prepare(
      'UPDATE skills SET endorsement_count = (SELECT COUNT(*) FROM endorsements WHERE skill_id = ?) WHERE id = ?'
    ).run(skill_id, skill_id);

    const updatedSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(skill_id);
    const endorsements = db.prepare('SELECT * FROM endorsements WHERE skill_id = ? ORDER BY created_at DESC').all(skill_id);

    return NextResponse.json({ skill: updatedSkill, endorsements }, { status: 201 });
  } catch (error) {
    console.error('Error endorsing skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
