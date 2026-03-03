// ============================
// Work Experience API Route
// POST /api/experience - Add work experience
// PUT /api/experience - Update work experience
// DELETE /api/experience - Delete work experience
// ============================
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { company, role, description, start_date, end_date, is_current, logo } = body;

    if (!company || !role || !start_date) {
      return NextResponse.json(
        { error: 'Company, role, and start date are required' },
        { status: 400 }
      );
    }

    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number } | undefined;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = db.prepare(
      `INSERT INTO work_experience (profile_id, company, role, description, start_date, end_date, is_current, logo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(profile.id, company, role, description || '', start_date, end_date || null, is_current ? 1 : 0, logo || '');

    const experience = db.prepare('SELECT * FROM work_experience WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error('Error adding experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { id, company, role, description, start_date, end_date, is_current, logo } = body;

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (is_current !== undefined) { updates.push('is_current = ?'); values.push(is_current ? 1 : 0); }
    if (logo !== undefined) { updates.push('logo = ?'); values.push(logo); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE work_experience SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const experience = db.prepare('SELECT * FROM work_experience WHERE id = ?').get(id);
    return NextResponse.json({ experience });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM work_experience WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
