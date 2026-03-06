import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, role, description, start_date, end_date, is_current, logo } = body;

    if (!company || !role || !start_date) {
      return NextResponse.json({ error: 'Company, role, and start date are required' }, { status: 400 });
    }

    const exp = await sql`
      INSERT INTO work_experience (profile_id, company, role, description, start_date, end_date, is_current, logo)
      VALUES (1, ${company}, ${role}, ${description || ''}, ${start_date}, ${end_date || null}, ${is_current ? true : false}, ${logo || ''})
      RETURNING *
    `;

    return NextResponse.json({ experience: exp[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, company, role, description, start_date, end_date, is_current, logo } = body;

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    if (company !== undefined) await sql`UPDATE work_experience SET company = ${company} WHERE id = ${id}`;
    if (role !== undefined) await sql`UPDATE work_experience SET role = ${role} WHERE id = ${id}`;
    if (description !== undefined) await sql`UPDATE work_experience SET description = ${description} WHERE id = ${id}`;
    if (start_date !== undefined) await sql`UPDATE work_experience SET start_date = ${start_date} WHERE id = ${id}`;
    if (end_date !== undefined) await sql`UPDATE work_experience SET end_date = ${end_date} WHERE id = ${id}`;
    if (is_current !== undefined) await sql`UPDATE work_experience SET is_current = ${is_current ? true : false} WHERE id = ${id}`;
    if (logo !== undefined) await sql`UPDATE work_experience SET logo = ${logo} WHERE id = ${id}`;

    const exp = await sql`SELECT * FROM work_experience WHERE id = ${id}`;
    return NextResponse.json({ experience: exp[0] });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM work_experience WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
