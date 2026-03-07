import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, url, icon } = body;

    if (!platform || !url) {
      return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 });
    }

    const link = await sql`
      INSERT INTO social_links (profile_id, platform, url, icon) 
      VALUES (1, ${platform}, ${url}, ${icon || platform.toLowerCase()}) 
      RETURNING *
    `;

    return NextResponse.json({ socialLink: link[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, platform, url, icon } = body;

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    if (platform) await sql`UPDATE social_links SET platform = ${platform} WHERE id = ${id}`;
    if (url) await sql`UPDATE social_links SET url = ${url} WHERE id = ${id}`;
    if (icon) await sql`UPDATE social_links SET icon = ${icon} WHERE id = ${id}`;

    const link = await sql`SELECT * FROM social_links WHERE id = ${id}`;
    return NextResponse.json({ socialLink: link[0] });
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM social_links WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
