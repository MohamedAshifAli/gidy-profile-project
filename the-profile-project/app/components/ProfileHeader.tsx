// ============================
// Profile Header Component
// ============================
'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { MapPinIcon, EditIcon } from './Icons';

interface ProfileHeaderProps {
  profile: Profile;
  onEdit: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileHeader({ profile, onEdit }: ProfileHeaderProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [profile.profile_picture]);

  return (
    <>
      {/* Cover Section */}
      <div className="cover-section">
        <div className="cover-pattern" />
      </div>

      {/* Profile Header */}
      <div className="page-container">
        <div className="profile-header">
          <div className="profile-header-content">
            {/* Avatar */}
            <div className="avatar-container">
              <div className="avatar">
                {profile.profile_picture && !imageError ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <div className="avatar-status" title="Available" />
            </div>

            {/* Profile Info */}
            <div className="profile-info">
              <h1 className="profile-name" id="profile-name">{profile.name}</h1>
              <p className="profile-title" id="profile-title">{profile.title}</p>
              {profile.location && (
                <span className="profile-location">
                  <MapPinIcon />
                  {profile.location}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={onEdit}
                id="edit-profile-btn"
              >
                <EditIcon size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
