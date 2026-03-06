// ============================
// Edit Profile Modal Component
// Tabbed editor for all profile sections
// ============================
'use client';

import React, { useState } from 'react';
import { Profile, SocialLink } from '@/lib/types';
import { XIcon, PlusIcon, TrashIcon } from './Icons';
import { useToast } from './Toast';

interface WorkExperience {
  id: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: number | boolean;
}

interface SkillData {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  endorsement_count: number;
}

interface EditProfileModalProps {
  profile: Profile;
  socialLinks: SocialLink[];
  skills: SkillData[];
  experience: WorkExperience[];
  onClose: () => void;
  onSaveProfile: (data: Partial<Profile>) => Promise<void>;
  onAddSkill: (data: { name: string; category: string; proficiency: number }) => Promise<void>;
  onDeleteSkill: (id: number) => Promise<void>;
  onAddSocialLink: (data: { platform: string; url: string; icon: string }) => Promise<void>;
  onDeleteSocialLink: (id: number) => Promise<void>;
  onAddExperience: (data: { company: string; role: string; description: string; start_date: string; end_date: string | null; is_current: boolean }) => Promise<void>;
  onDeleteExperience: (id: number) => Promise<void>;
}

type Tab = 'profile' | 'skills' | 'social' | 'experience';

export default function EditProfileModal({
  profile,
  socialLinks,
  skills,
  experience,
  onClose,
  onSaveProfile,
  onAddSkill,
  onDeleteSkill,
  onAddSocialLink,
  onDeleteSocialLink,
  onAddExperience,
  onDeleteExperience,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Profile form state
  const [formData, setFormData] = useState({
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    profile_picture: profile.profile_picture,
  });

  // New skill form
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', proficiency: 75 });

  // New social link form
  const [newLink, setNewLink] = useState({ platform: '', url: '', icon: '' });

  // New experience form
  const [newExp, setNewExp] = useState({
    company: '', role: '', description: '', start_date: '', end_date: '', is_current: false,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await onSaveProfile(formData);
      showToast('Profile updated successfully!');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name) {
      showToast('Skill name is required', 'error');
      return;
    }
    try {
      await onAddSkill(newSkill);
      setNewSkill({ name: '', category: 'Frontend', proficiency: 75 });
      showToast('Skill added! 🎯');
    } catch {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleAddLink = async () => {
    if (!newLink.platform || !newLink.url) {
      showToast('Platform and URL are required', 'error');
      return;
    }
    try {
      await onAddSocialLink({ ...newLink, icon: newLink.icon || newLink.platform.toLowerCase() });
      setNewLink({ platform: '', url: '', icon: '' });
      showToast('Social link added! 🔗');
    } catch {
      showToast('Failed to add link', 'error');
    }
  };

  const handleAddExperience = async () => {
    if (!newExp.company || !newExp.role || !newExp.start_date) {
      showToast('Company, role, and start date are required', 'error');
      return;
    }
    try {
      await onAddExperience({
        ...newExp,
        end_date: newExp.end_date || null,
      });
      setNewExp({ company: '', role: '', description: '', start_date: '', end_date: '', is_current: false });
      showToast('Experience added! 💼');
    } catch {
      showToast('Failed to add experience', 'error');
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'skills', label: '⚡ Skills' },
    { key: 'social', label: '🔗 Links' },
    { key: 'experience', label: '💼 Experience' },
  ];

  return (
    <div className="edit-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="edit-modal" id="edit-modal">
        {/* Header */}
        <div className="edit-modal-header">
          <h2 className="edit-modal-title">Edit Profile</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-edit-btn">
            <XIcon size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 28px' }}>
          <div className="edit-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`edit-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="edit-modal-body">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    id="edit-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    id="edit-location"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <input
                  className="form-input"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  id="edit-title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  id="edit-bio"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    id="edit-email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    id="edit-phone"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Profile Picture URL or Upload</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    value={formData.profile_picture || ''}
                    onChange={e => setFormData({ ...formData, profile_picture: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    id="edit-profile-picture"
                    style={{ flex: 1 }}
                  />
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <button className="btn btn-secondary" style={{ height: '100%', padding: '0 15px' }}>
                      Upload
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 400;
                              const scaleSize = MAX_WIDTH / img.width;
                              canvas.width = MAX_WIDTH;
                              canvas.height = img.height * scaleSize;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                              setFormData({ ...formData, profile_picture: dataUrl });
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <>
              {skills.map(skill => (
                <div key={skill.id} className="skill-edit-item">
                  <div className="skill-info">
                    <div className="skill-name">{skill.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      {skill.category} · {skill.proficiency}% · {skill.endorsement_count} endorsements
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDeleteSkill(skill.id)}
                    style={{ color: '#EF4444' }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Add New Skill
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      className="form-input"
                      placeholder="Skill name"
                      value={newSkill.name}
                      onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={newSkill.category}
                      onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Design">Design</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Proficiency: {newSkill.proficiency}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={e => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAddSkill}>
                  <PlusIcon size={14} /> Add Skill
                </button>
              </div>
            </>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <>
              {socialLinks.map(link => (
                <div key={link.id} className="social-link-edit">
                  <span className="link-platform">{link.platform}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.url}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDeleteSocialLink(link.id)}
                    style={{ color: '#EF4444' }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Add New Link
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      className="form-input"
                      placeholder="Platform (e.g., GitHub)"
                      value={newLink.platform}
                      onChange={e => setNewLink({ ...newLink, platform: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      className="form-input"
                      placeholder="URL"
                      value={newLink.url}
                      onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAddLink}>
                  <PlusIcon size={14} /> Add Link
                </button>
              </div>
            </>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <>
              {experience.map(exp => (
                <div key={exp.id} className="experience-edit-item">
                  <div className="experience-edit-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{exp.company}</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{exp.role}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        {exp.start_date} – {(exp.is_current === 1 || exp.is_current === true) ? 'Present' : exp.end_date || ''}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDeleteExperience(exp.id)}
                      style={{ color: '#EF4444' }}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Add New Experience
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      className="form-input"
                      value={newExp.company}
                      onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      className="form-input"
                      value={newExp.role}
                      onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={newExp.description}
                    onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                    style={{ minHeight: '70px' }}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      className="form-input"
                      type="month"
                      value={newExp.start_date}
                      onChange={e => setNewExp({ ...newExp, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      className="form-input"
                      type="month"
                      value={newExp.end_date}
                      onChange={e => setNewExp({ ...newExp, end_date: e.target.value })}
                      disabled={newExp.is_current}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="is-current"
                    checked={newExp.is_current}
                    onChange={e => setNewExp({ ...newExp, is_current: e.target.checked, end_date: '' })}
                  />
                  <label htmlFor="is-current" className="form-label" style={{ marginBottom: 0 }}>
                    I currently work here
                  </label>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAddExperience}>
                  <PlusIcon size={14} /> Add Experience
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'profile' && (
          <div className="edit-modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
              id="save-profile-btn"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
