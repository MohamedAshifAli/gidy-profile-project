// ============================
// Main Profile Page
// Client component that orchestrates all sections
// ============================
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, SocialLink } from '@/lib/types';
import { DEFAULT_PROFILE, DEFAULT_SOCIAL_LINKS, DEFAULT_SKILLS, DEFAULT_EXPERIENCE } from '@/lib/data';
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

  // Use your deployed URL for Production, and Localhost for Development
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                 (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                  ? 'http://localhost:5050/api' 
                  : '/api');

  // ============================
  // Fetch profile data from API
  // ============================
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/profile?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      
      // Use backend data if it exists, otherwise fallback to defaults
      const hasBackendProfile = data.profile && (data.profile.name || data.profile.bio);
      
      setProfile(hasBackendProfile ? data.profile : DEFAULT_PROFILE);
      
      setSocialLinks(data.socialLinks && data.socialLinks.length > 0 
        ? data.socialLinks 
        : DEFAULT_SOCIAL_LINKS);
        
      setSkills(data.skills && data.skills.length > 0 
        ? data.skills 
        : DEFAULT_SKILLS);
        
      setExperience(data.workExperience && data.workExperience.length > 0 
        ? data.workExperience 
        : DEFAULT_EXPERIENCE);

    } catch (err) {
      console.error('Error fetching profile:', err);
      // Even on error, show the default static data instead of an empty screen
      setProfile(DEFAULT_PROFILE);
      setSocialLinks(DEFAULT_SOCIAL_LINKS);
      setSkills(DEFAULT_SKILLS);
      setExperience(DEFAULT_EXPERIENCE);
    } finally {
      setLoading(false);
    }
  }, [showToast, API_URL]);

  // ============================
  // Fetch theme setting
  // ============================
  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
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
      await fetch(`${API_URL}/settings`, {
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
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    await fetchProfile();
  };

  const handleAddSkill = async (data: { name: string; category: string; proficiency: number }) => {
    const res = await fetch(`${API_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add skill');
    await fetchProfile();
  };

  const handleDeleteSkill = async (id: number) => {
    const res = await fetch(`${API_URL}/skills?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete skill');
    await fetchProfile();
  };

  const handleAddSocialLink = async (data: { platform: string; url: string; icon: string }) => {
    const res = await fetch(`${API_URL}/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add social link');
    await fetchProfile();
  };

  const handleDeleteSocialLink = async (id: number) => {
    const res = await fetch(`${API_URL}/social-links?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete social link');
    await fetchProfile();
  };

  const handleAddExperience = async (data: any) => {
    const res = await fetch(`${API_URL}/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add experience');
    await fetchProfile();
  };

  const handleUpdateExperience = async (data: any) => {
    const res = await fetch(`${API_URL}/experience`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update experience');
    await fetchProfile();
  };

  const handleDeleteExperience = async (id: number) => {
    const res = await fetch(`${API_URL}/experience?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete experience');
    await fetchProfile();
  };

  // ============================
  // Skill Endorsement Handler
  // ============================
  const handleEndorse = async (skillId: number, endorserName: string) => {
    const res = await fetch(`${API_URL}/endorsements`, {
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
          onUpdateExperience={handleUpdateExperience}
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
