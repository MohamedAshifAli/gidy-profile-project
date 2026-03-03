// ============================
// Social Links API Route
// POST /api/social-links - Add a social link
// PUT /api/social-links - Update a social link
// DELETE /api/social-links - Delete a social link
// ============================
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { platform, url, icon } = body;

    if (!platform || !url) {
      return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 });
    }

    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number } | undefined;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = db.prepare(
      'INSERT INTO social_links (profile_id, platform, url, icon) VALUES (?, ?, ?, ?)'
    ).run(profile.id, platform, url, icon || platform.toLowerCase());

    const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ socialLink: link }, { status: 201 });
  } catch (error) {
    console.error('Error adding social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { id, platform, url, icon } = body;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (platform) { updates.push('platform = ?'); values.push(platform); }
    if (url) { updates.push('url = ?'); values.push(url); }
    if (icon) { updates.push('icon = ?'); values.push(icon); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE social_links SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(id);
    return NextResponse.json({ socialLink: link });
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM social_links WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
