// ============================
// Profile API Route
// GET /api/profile - Fetch profile with all related data
// PUT /api/profile - Update profile information
// ============================
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    let profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
    
    // If no profile exists, create a default empty one
    if (!profile) {
      db.prepare(`
        INSERT INTO profiles (name, title, bio, email, phone, location, profile_picture, cover_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('', '', '', '', '', '', '', '');
      profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
    }

    const profileId = (profile as { id: number }).id;

    const socialLinks = db.prepare('SELECT * FROM social_links WHERE profile_id = ?').all(profileId);
    const skills = db.prepare('SELECT * FROM skills WHERE profile_id = ? ORDER BY endorsement_count DESC').all(profileId);
    const workExperience = db.prepare(
      'SELECT * FROM work_experience WHERE profile_id = ? ORDER BY is_current DESC, start_date DESC'
    ).all(profileId);

    // Get endorsements for each skill
    const skillsWithEndorsements = (skills as { id: number }[]).map((skill) => {
      const endorsements = db.prepare('SELECT * FROM endorsements WHERE skill_id = ? ORDER BY created_at DESC').all(skill.id);
      return { ...skill, endorsements };
    });

    return NextResponse.json({
      profile,
      socialLinks,
      skills: skillsWithEndorsements,
      workExperience,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const { name, title, bio, email, phone, location, profile_picture, cover_image } = body;

    let profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number } | undefined;
    
    // If no profile exists, create one first
    if (!profile) {
      const r = db.prepare(`
        INSERT INTO profiles (name, title, bio, email, phone, location, profile_picture, cover_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('', '', '', '', '', '', '', '');
      profile = { id: r.lastInsertRowid as number };
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (profile_picture !== undefined) { updates.push('profile_picture = ?'); values.push(profile_picture); }
    if (cover_image !== undefined) { updates.push('cover_image = ?'); values.push(cover_image); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(profile.id);

    db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedProfile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile.id);
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
