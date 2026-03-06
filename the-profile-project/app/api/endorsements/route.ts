import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_id, endorser_name, endorser_avatar } = body;

    if (!skill_id || !endorser_name) {
      return NextResponse.json({ error: 'Skill ID and endorser name are required' }, { status: 400 });
    }

    // Check if this endorser already endorsed this skill
    const existing = await sql`
      SELECT id FROM endorsements WHERE skill_id = ${skill_id} AND endorser_name = ${endorser_name}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already endorsed this skill' }, { status: 409 });
    }

    // Add endorsement
    await sql`
      INSERT INTO endorsements (skill_id, endorser_name, endorser_avatar) 
      VALUES (${skill_id}, ${endorser_name}, ${endorser_avatar || ''})
    `;

    // Update endorsement count
    await sql`
      UPDATE skills SET endorsement_count = (SELECT COUNT(*) FROM endorsements WHERE skill_id = ${skill_id}) 
      WHERE id = ${skill_id}
    `;

    const updatedSkills = await sql`SELECT * FROM skills WHERE id = ${skill_id}`;
    const endorsements = await sql`SELECT * FROM endorsements WHERE skill_id = ${skill_id} ORDER BY created_at DESC`;

    return NextResponse.json({ skill: updatedSkills[0], endorsements }, { status: 201 });
  } catch (error) {
    console.error('Error endorsing skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
