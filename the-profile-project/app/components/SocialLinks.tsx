// ============================
// Social Links Component
// ============================
'use client';

import React from 'react';
import { SocialLink } from '@/lib/types';
import { getIconByName } from './Icons';

interface SocialLinksProps {
  links: SocialLink[];
}

export default function SocialLinks({ links }: SocialLinksProps) {
  if (links.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-title-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              🔗
            </span>
            Social Links
          </h2>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🌐</div>
          <p className="empty-state-text">No social links added yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
            🔗
          </span>
          Social Links
        </h2>
      </div>
      <div className="social-links-grid" id="social-links">
        {links.map(link => {
          const IconComponent = getIconByName(link.icon || link.platform);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              title={link.platform}
            >
              <IconComponent size={18} />
              <span>{link.platform}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
