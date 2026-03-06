import express, { Request, Response } from 'express';
import cors from 'cors';
import getDb from '../lib/db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Profile GET
app.get('/api/profile', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const profileId = (profile as { id: number }).id;
    const socialLinks = db.prepare('SELECT * FROM social_links WHERE profile_id = ?').all(profileId);
    const skills = db.prepare('SELECT * FROM skills WHERE profile_id = ? ORDER BY endorsement_count DESC').all(profileId);
    const workExperience = db.prepare('SELECT * FROM work_experience WHERE profile_id = ? ORDER BY is_current DESC, start_date DESC').all(profileId);
    const skillsWithEndorsements = (skills as { id: number }[]).map((skill) => {
      const endorsements = db.prepare('SELECT * FROM endorsements WHERE skill_id = ? ORDER BY created_at DESC').all(skill.id);
      return { ...skill, endorsements };
    });
    res.json({ profile, socialLinks, skills: skillsWithEndorsements, workExperience });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Profile PUT
app.put('/api/profile', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, title, bio, email, phone, location, profile_picture, cover_image } = req.body;
    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number } | undefined;
    if (!profile) return res.status(404).json({ error: 'Not found' });
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
    if (!updates.length) return res.status(400).json({ error: 'No fields' });
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(profile.id);
    db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    res.json({ profile: db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile.id) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Settings GET/PUT
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const rows = getDb().prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json({ settings });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Missing key/value' });
    getDb().prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`).run(key, value, value);
    res.json({ success: true, settings: { [key]: value } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Skills POST/DELETE
app.post('/api/skills', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, category, proficiency } = req.body;
    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number };
    const r = db.prepare('INSERT INTO skills (profile_id, name, category, proficiency) VALUES (?, ?, ?, ?)').run(profile.id, name, category || 'General', proficiency || 75);
    res.status(201).json({ skill: db.prepare('SELECT * FROM skills WHERE id = ?').get(r.lastInsertRowid) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.delete('/api/skills', (req: Request, res: Response) => {
  try { getDb().prepare('DELETE FROM skills WHERE id = ?').run(Number(req.query.id)); res.json({ success: true }); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Social Links POST/DELETE
app.post('/api/social-links', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { platform, url, icon } = req.body;
    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number };
    const r = db.prepare('INSERT INTO social_links (profile_id, platform, url, icon) VALUES (?, ?, ?, ?)').run(profile.id, platform, url, icon || '');
    res.status(201).json({ socialLink: db.prepare('SELECT * FROM social_links WHERE id = ?').get(r.lastInsertRowid) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.delete('/api/social-links', (req: Request, res: Response) => {
  try { getDb().prepare('DELETE FROM social_links WHERE id = ?').run(Number(req.query.id)); res.json({ success: true }); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Experience POST/PUT/DELETE
app.post('/api/experience', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { company, role, description, start_date, end_date, is_current, logo } = req.body;
    const profile = db.prepare('SELECT id FROM profiles LIMIT 1').get() as { id: number };
    const r = db.prepare('INSERT INTO work_experience (profile_id, company, role, description, start_date, end_date, is_current, logo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(profile.id, company, role, description || '', start_date, end_date || null, is_current ? 1 : 0, logo || '');
    res.status(201).json({ experience: db.prepare('SELECT * FROM work_experience WHERE id = ?').get(r.lastInsertRowid) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.put('/api/experience', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { id, company, role, description, start_date, end_date, is_current, logo } = req.body;
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];
    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (is_current !== undefined) { updates.push('is_current = ?'); values.push(is_current ? 1 : 0); }
    if (logo !== undefined) { updates.push('logo = ?'); values.push(logo); }
    values.push(id);
    db.prepare(`UPDATE work_experience SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    res.json({ experience: db.prepare('SELECT * FROM work_experience WHERE id = ?').get(id) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.delete('/api/experience', (req: Request, res: Response) => {
  try { getDb().prepare('DELETE FROM work_experience WHERE id = ?').run(Number(req.query.id)); res.json({ success: true }); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Endorsements POST
app.post('/api/endorsements', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { skill_id, endorser_name } = req.body;
    db.prepare('INSERT INTO endorsements (skill_id, endorser_name, endorser_avatar) VALUES (?, ?, ?)').run(skill_id, endorser_name, '');
    db.prepare('UPDATE skills SET endorsement_count = endorsement_count + 1 WHERE id = ?').run(skill_id);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
