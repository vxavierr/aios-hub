import React from 'react';
import './ThemeToggle.css';

/**
 * Theme toggle component for switching between dark and light mode
 */
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'dark' ? '\u2600' : '\u263D'}
      </span>
    </button>
  );
}

export default ThemeToggle;
