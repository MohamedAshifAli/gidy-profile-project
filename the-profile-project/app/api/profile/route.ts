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

    // Use a single UPSERT query to update the profile efficiently
    // This ensures either a new profile is created or the existing one (id=1) is updated in one atomic step
    await sql`
      INSERT INTO profiles (id, name, title, bio, email, phone, location, profile_picture, cover_image)
      VALUES (
        1::integer, 
        ${name || ''}, 
        ${title || ''}, 
        ${bio || ''}, 
        ${email || ''}, 
        ${phone || ''}, 
        ${location || ''}, 
        ${profile_picture || ''}, 
        ${cover_image || ''}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, profiles.name),
        title = COALESCE(EXCLUDED.title, profiles.title),
        bio = COALESCE(EXCLUDED.bio, profiles.bio),
        email = COALESCE(EXCLUDED.email, profiles.email),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        location = COALESCE(EXCLUDED.location, profiles.location),
        profile_picture = COALESCE(EXCLUDED.profile_picture, profiles.profile_picture),
        cover_image = COALESCE(EXCLUDED.cover_image, profiles.cover_image),
        updated_at = CURRENT_TIMESTAMP
    `;

    const updatedProfiles = await sql`SELECT * FROM profiles WHERE id = 1`;
    return NextResponse.json({ profile: updatedProfiles[0] });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    // Return the specific error message to help debugging
    return NextResponse.json({ 
      error: 'Failed to save changes', 
      details: error.message || 'Unknown database error' 
    }, { status: 500 });
  }
}
