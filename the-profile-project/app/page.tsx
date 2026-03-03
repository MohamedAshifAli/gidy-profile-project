// ============================
// Main Profile Page
// Client component that orchestrates all sections
// ============================
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, SocialLink } from '@/lib/types';
import { ToastProvider, useToast } from './components/Toast';
import ProfileHeader from './components/ProfileHeader';
import BioSection from './components/BioSection';
import SocialLinks from './components/SocialLinks';
import SkillsSection from './components/SkillsSection';
import WorkTimeline from './components/WorkTimeline';
import EditProfileModal from './components/EditProfileModal';
import ThemeToggle from './components/ThemeToggle';

/* eslint-disable @typescript-eslint/no-explicit-any */

function ProfilePageContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState<string>('light');
  const { showToast } = useToast();

  // ============================
  // Fetch profile data from API
  // ============================
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data.profile);
      setSocialLinks(data.socialLinks);
      setSkills(data.skills);
      setExperience(data.workExperience);
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ============================
  // Fetch theme setting
  // ============================
  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const savedTheme = data.settings?.theme || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch {
      // Use default light theme
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTheme();
  }, [fetchProfile, fetchTheme]);

  // ============================
  // Theme Toggle Handler
  // ============================
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'theme', value: newTheme }),
      });
    } catch {
      // Theme still works locally even if save fails
    }
  };

  // ============================
  // Profile Update Handlers
  // ============================
  const handleSaveProfile = async (data: Partial<Profile>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    await fetchProfile();
  };

  const handleAddSkill = async (data: { name: string; category: string; proficiency: number }) => {
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add skill');
    await fetchProfile();
  };

  const handleDeleteSkill = async (id: number) => {
    const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete skill');
    await fetchProfile();
  };

  const handleAddSocialLink = async (data: { platform: string; url: string; icon: string }) => {
    const res = await fetch('/api/social-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add social link');
    await fetchProfile();
  };

  const handleDeleteSocialLink = async (id: number) => {
    const res = await fetch(`/api/social-links?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete social link');
    await fetchProfile();
  };

  const handleAddExperience = async (data: any) => {
    const res = await fetch('/api/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add experience');
    await fetchProfile();
  };

  const handleDeleteExperience = async (id: number) => {
    const res = await fetch(`/api/experience?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete experience');
    await fetchProfile();
  };

  // ============================
  // Skill Endorsement Handler
  // ============================
  const handleEndorse = async (skillId: number, endorserName: string) => {
    const res = await fetch('/api/endorsements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_id: skillId, endorser_name: endorserName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to endorse skill');
    }
    await fetchProfile();
  };

  // ============================
  // Loading State
  // ============================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span className="loading-text">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="loading-container">
        <div style={{ fontSize: '3rem' }}>😞</div>
        <span className="loading-text">Profile not found</span>
      </div>
    );
  }

  return (
    <>
      <ProfileHeader profile={profile} onEdit={() => setIsEditing(true)} />

      <div className="page-container">
        {/* Bio Section */}
        <BioSection profile={profile} />

        {/* Content Grid */}
        <div className="content-grid">
          {/* Social Links */}
          <SocialLinks links={socialLinks} />

          {/* Skills with Endorsement */}
          <SkillsSection skills={skills} onEndorse={handleEndorse} />

          {/* Work Timeline */}
          <WorkTimeline experience={experience} />
        </div>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Edit Modal */}
      {isEditing && (
        <EditProfileModal
          profile={profile}
          socialLinks={socialLinks}
          skills={skills}
          experience={experience}
          onClose={() => setIsEditing(false)}
          onSaveProfile={handleSaveProfile}
          onAddSkill={handleAddSkill}
          onDeleteSkill={handleDeleteSkill}
          onAddSocialLink={handleAddSocialLink}
          onDeleteSocialLink={handleDeleteSocialLink}
          onAddExperience={handleAddExperience}
          onDeleteExperience={handleDeleteExperience}
        />
      )}
    </>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider>
      <ProfilePageContent />
    </ToastProvider>
  );
}
