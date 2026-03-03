// ============================
// Bio Section Component
// ============================
'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { MailIcon, PhoneIcon } from './Icons';

interface BioSectionProps {
  profile: Profile;
}

export default function BioSection({ profile }: BioSectionProps) {
  return (
    <div className="card bio-section">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
            📋
          </span>
          About
        </h2>
      </div>
      <p className="bio-text" id="profile-bio">{profile.bio}</p>

      <div className="contact-row">
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="contact-item" style={{ textDecoration: 'none' }}>
            <MailIcon />
            <span>{profile.email}</span>
          </a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="contact-item" style={{ textDecoration: 'none' }}>
            <PhoneIcon />
            <span>{profile.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
