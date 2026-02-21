import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useThemeContext } from '../../context/ThemeContext';
import './Header.css';

function Header() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header className="header" role="banner">
      <div className="header-content">
        <Link to="/" className="header-logo" aria-label="AIOS Health - Home">
          <span className="logo-icon" aria-hidden="true">+</span>
          <span className="logo-text">AIOS Health</span>
        </Link>
        <div className="header-actions">
          <nav className="header-nav" aria-label="Main navigation">
            <Link to="/" className="nav-link" aria-current="page">Dashboard</Link>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
    </header>
  );
}

export default Header;
