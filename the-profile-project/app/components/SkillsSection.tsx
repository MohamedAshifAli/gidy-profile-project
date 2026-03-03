// ============================
// Skills Section Component
// With Endorsement System (Innovation Feature)
// ============================
'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUpIcon, CheckIcon, SparklesIcon } from './Icons';
import { useToast } from './Toast';

interface SkillWithEndorsements {
  id: number;
  profile_id: number;
  name: string;
  category: string;
  proficiency: number;
  endorsement_count: number;
  endorsements: {
    id: number;
    skill_id: number;
    endorser_name: string;
    endorser_avatar: string;
    created_at: string;
  }[];
}

interface SkillsSectionProps {
  skills: SkillWithEndorsements[];
  onEndorse: (skillId: number, endorserName: string) => Promise<void>;
}

export default function SkillsSection({ skills, onEndorse }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [endorsingSkillId, setEndorsingSkillId] = useState<number | null>(null);
  const [endorserName, setEndorserName] = useState('');
  const [animatedSkills, setAnimatedSkills] = useState<Set<number>>(new Set());
  const { showToast } = useToast();

  const categories = ['All', ...Array.from(new Set(skills.map(s => s.category)))];
  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter(s => s.category === activeCategory);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSkills(new Set(skills.map(s => s.id)));
    }, 300);
    return () => clearTimeout(timer);
  }, [skills]);

  const handleEndorseClick = (skillId: number) => {
    setEndorsingSkillId(skillId);
  };

  const handleEndorseSubmit = async (skillId: number) => {
    if (!endorserName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    try {
      await onEndorse(skillId, endorserName.trim());
      setEndorsingSkillId(null);
      setEndorserName('');
      showToast('Skill endorsed successfully! 🎉');
    } catch {
      showToast('Could not endorse this skill', 'error');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-title-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <SparklesIcon size={18} />
          </span>
          Skills & Expertise
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          {skills.length} skills
        </span>
      </div>

      {/* Category Filter */}
      <div className="skills-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`skill-category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="skills-grid" id="skills-grid">
        {filteredSkills.map(skill => (
          <div key={skill.id} className="skill-item">
            <div className="skill-info">
              <div className="skill-name">{skill.name}</div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{ width: animatedSkills.has(skill.id) ? `${skill.proficiency}%` : '0%' }}
                />
              </div>
            </div>

            {/* Endorsement Button */}
            {endorsingSkillId === skill.id ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={endorserName}
                  onChange={e => setEndorserName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEndorseSubmit(skill.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    border: '1.5px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    width: '100px',
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
                <button
                  className="skill-endorsement-btn endorsed"
                  onClick={() => handleEndorseSubmit(skill.id)}
                  title="Confirm endorsement"
                >
                  <CheckIcon size={12} />
                </button>
              </div>
            ) : (
              <button
                className="skill-endorsement-btn"
                onClick={() => handleEndorseClick(skill.id)}
                title="Endorse this skill"
              >
                <ThumbsUpIcon size={14} />
                <span>{skill.endorsement_count}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">No skills in this category</p>
        </div>
      )}
    </div>
  );
}
