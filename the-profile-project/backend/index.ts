import express, { Request, Response } from 'express';
import cors from 'cors';
import sql from '../lib/db';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Prevent caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Profile GET
app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const profiles = await sql`SELECT * FROM profiles WHERE id = 1`;
    let profile = profiles[0];
    
    if (!profile) {
      await sql`INSERT INTO profiles (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
      const fresh = await sql`SELECT * FROM profiles WHERE id = 1`;
      profile = fresh[0];
    }

    const profileId = 1;
    const socialLinks = await sql`SELECT * FROM social_links WHERE profile_id = ${profileId}`;
    const skills = await sql`SELECT * FROM skills WHERE profile_id = ${profileId} ORDER BY endorsement_count DESC`;
    const workExperience = await sql`SELECT * FROM work_experience WHERE profile_id = ${profileId} ORDER BY is_current DESC, start_date DESC`;
    
    const skillsWithEndorsements = await Promise.all(skills.map(async (skill) => {
      const endorsements = await sql`SELECT * FROM endorsements WHERE skill_id = ${skill.id} ORDER BY created_at DESC`;
      return { ...skill, endorsements };
    }));
    
    res.json({ profile, socialLinks, skills: skillsWithEndorsements, workExperience });
  } catch (error) { 
    console.error('GET Profile Error:', error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

// Profile PUT
app.put('/api/profile', async (req: Request, res: Response) => {
  try {
    const { name, title, bio, email, phone, location, profile_picture, cover_image } = req.body;
    
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
    
    const profiles = await sql`SELECT * FROM profiles WHERE id = 1`;
    res.json({ profile: profiles[0] });
  } catch (error) { 
    console.error('PUT Profile Error:', error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

// Settings GET/PUT
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const rows = await sql`SELECT * FROM settings`;
    const settings = rows.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {});
    res.json({ settings });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Missing key/value' });
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
    res.json({ success: true, settings: { [key]: value } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Skills POST/DELETE
app.post('/api/skills', async (req: Request, res: Response) => {
  try {
    const { name, category, proficiency } = req.body;
    const skills = await sql`
      INSERT INTO skills (profile_id, name, category, proficiency) 
      VALUES (1, ${name}, ${category || 'General'}, ${proficiency || 75}) 
      RETURNING *
    `;
    res.status(201).json({ skill: skills[0] });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/skills', async (req: Request, res: Response) => {
  try { 
    await sql`DELETE FROM skills WHERE id = ${Number(req.query.id)}`; 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Social Links POST/DELETE
app.post('/api/social-links', async (req: Request, res: Response) => {
  try {
    const { platform, url, icon } = req.body;
    const links = await sql`
      INSERT INTO social_links (profile_id, platform, url, icon) 
      VALUES (1, ${platform}, ${url}, ${icon || ''}) 
      RETURNING *
    `;
    res.status(201).json({ socialLink: links[0] });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/social-links', async (req: Request, res: Response) => {
  try { 
    await sql`DELETE FROM social_links WHERE id = ${Number(req.query.id)}`; 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Experience POST/PUT/DELETE
app.post('/api/experience', async (req: Request, res: Response) => {
  try {
    const { company, role, description, start_date, end_date, is_current, logo } = req.body;
    const exp = await sql`
      INSERT INTO work_experience (profile_id, company, role, description, start_date, end_date, is_current, logo) 
      VALUES (1, ${company}, ${role}, ${description || ''}, ${start_date}, ${end_date || null}, ${is_current ? true : false}, ${logo || ''}) 
      RETURNING *
    `;
    res.status(201).json({ experience: exp[0] });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/experience', async (req: Request, res: Response) => {
  try {
    const { id, company, role, description, start_date, end_date, is_current, logo } = req.body;
    if (company !== undefined) await sql`UPDATE work_experience SET company = ${company} WHERE id = ${id}`;
    if (role !== undefined) await sql`UPDATE work_experience SET role = ${role} WHERE id = ${id}`;
    if (description !== undefined) await sql`UPDATE work_experience SET description = ${description} WHERE id = ${id}`;
    if (start_date !== undefined) await sql`UPDATE work_experience SET start_date = ${start_date} WHERE id = ${id}`;
    if (end_date !== undefined) await sql`UPDATE work_experience SET end_date = ${end_date} WHERE id = ${id}`;
    if (is_current !== undefined) await sql`UPDATE work_experience SET is_current = ${is_current ? true : false} WHERE id = ${id}`;
    if (logo !== undefined) await sql`UPDATE work_experience SET logo = ${logo} WHERE id = ${id}`;
    
    const exp = await sql`SELECT * FROM work_experience WHERE id = ${id}`;
    res.json({ experience: exp[0] });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/experience', async (req: Request, res: Response) => {
  try { 
    await sql`DELETE FROM work_experience WHERE id = ${Number(req.query.id)}`; 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Endorsements POST
app.post('/api/endorsements', async (req: Request, res: Response) => {
  try {
    const { skill_id, endorser_name } = req.body;
    await sql`INSERT INTO endorsements (skill_id, endorser_name, endorser_avatar) VALUES (${skill_id}, ${endorser_name}, '')`;
    await sql`UPDATE skills SET endorsement_count = endorsement_count + 1 WHERE id = ${skill_id}`;
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
