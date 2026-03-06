// ============================
// Profile API Route
// GET /api/profile - Fetch profile with all related data
// PUT /api/profile - Update profile information
// ============================
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const profiles = await sql`SELECT * FROM profiles WHERE id = 1`;
    let profile = profiles[0];
    
    // Ensure profile row exists
    if (!profile) {
      await sql`INSERT INTO profiles (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
      const fresh = await sql`SELECT * FROM profiles WHERE id = 1`;
      profile = fresh[0];
    }

    const profileId = 1;

    const socialLinks = await sql`SELECT * FROM social_links WHERE profile_id = ${profileId}`;
    const skills = await sql`SELECT * FROM skills WHERE profile_id = ${profileId} ORDER BY endorsement_count DESC`;
    const workExperience = await sql`SELECT * FROM work_experience WHERE profile_id = ${profileId} ORDER BY is_current DESC, start_date DESC`;

    // Get endorsements for each skill
    const skillsWithEndorsements = await Promise.all(skills.map(async (skill) => {
      const endorsements = await sql`SELECT * FROM endorsements WHERE skill_id = ${skill.id} ORDER BY created_at DESC`;
      return { ...skill, endorsements };
    }));

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
    const body = await request.json();
    const { name, title, bio, email, phone, location, profile_picture, cover_image } = body;

    // Ensure profile row exists
    await sql`INSERT INTO profiles (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;

    if (name !== undefined) await sql`UPDATE profiles SET name = ${name} WHERE id = 1`;
    if (title !== undefined) await sql`UPDATE profiles SET title = ${title} WHERE id = 1`;
    if (bio !== undefined) await sql`UPDATE profiles SET bio = ${bio} WHERE id = 1`;
    if (email !== undefined) await sql`UPDATE profiles SET email = ${email} WHERE id = 1`;
    if (phone !== undefined) await sql`UPDATE profiles SET phone = ${phone} WHERE id = 1`;
    if (location !== undefined) await sql`UPDATE profiles SET location = ${location} WHERE id = 1`;
    if (profile_picture !== undefined) await sql`UPDATE profiles SET profile_picture = ${profile_picture} WHERE id = 1`;
    if (cover_image !== undefined) await sql`UPDATE profiles SET cover_image = ${cover_image} WHERE id = 1`;

    await sql`UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = 1`;

    const updatedProfiles = await sql`SELECT * FROM profiles WHERE id = 1`;
    return NextResponse.json({ profile: updatedProfiles[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
