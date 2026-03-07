import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, proficiency } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const skill = await sql`
      INSERT INTO skills (profile_id, name, category, proficiency, endorsement_count) 
      VALUES (1, ${name}, ${category}, ${proficiency || 50}, 0) 
      RETURNING *
    `;

    return NextResponse.json({ skill: skill[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Cascade delete is handled by the database foreign key in Neon
    await sql`DELETE FROM skills WHERE id = ${Number(id)}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
