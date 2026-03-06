// ============================
// Work Timeline Component
// Interactive animated timeline
// ============================
'use client';

import React from 'react';
import { BriefcaseIcon } from './Icons';

interface WorkExperience {
  id: number;
  profile_id: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: number | boolean;
  logo: string;
}

interface WorkTimelineProps {
  experience: WorkExperience[];
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default function WorkTimeline({ experience }: WorkTimelineProps) {
  if (experience.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-title-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
              <BriefcaseIcon size={18} />
            </span>
            Work Experience
          </h2>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <p className="empty-state-text">No work experience added yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <BriefcaseIcon size={18} />
          </span>
          Work Experience
        </h2>
      </div>

      <div className="timeline" id="work-timeline">
        {experience.map(exp => {
          const isCurrent = exp.is_current === 1 || exp.is_current === true;
          return (
            <div key={exp.id} className="timeline-item">
              <div className={`timeline-dot ${isCurrent ? 'current' : ''}`} />
              <div className="timeline-content">
                <div className="timeline-company">{exp.company}</div>
                <div className="timeline-role">{exp.role}</div>
                <div className="timeline-date">
                  <span>{formatDate(exp.start_date)}</span>
                  <span>–</span>
                  <span>{isCurrent ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}</span>
                  {isCurrent && <span className="current-badge">Current</span>}
                </div>
                {exp.description && (
                  <ul className="timeline-description" style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                    {exp.description
                      .split(/\n+/)
                      .flatMap((line) => line.trim().split(/\.\s+/))
                      .filter((text) => text.trim().length > 0)
                      .map((bullet, i) => {
                        let text = bullet.trim();
                        if (!text.endsWith('.')) text += '.';
                        return (
                          <li key={i} style={{ marginBottom: '6px' }}>
                            {text}
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
