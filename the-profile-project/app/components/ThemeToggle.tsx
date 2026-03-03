// ============================
// Theme Toggle Component
// Persistent dark/light mode
// ============================
'use client';

import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  theme: string;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <div className="theme-toggle-container">
      <button
        className="theme-toggle"
        onClick={onToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        id="theme-toggle-btn"
      >
        {theme === 'light' ? <MoonIcon size={22} /> : <SunIcon size={22} />}
      </button>
    </div>
  );
}
