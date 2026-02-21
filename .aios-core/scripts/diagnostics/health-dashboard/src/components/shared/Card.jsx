import React from 'react';
import './Card.css';

/**
 * Reusable card component for dashboard widgets
 */
function Card({
  title,
  subtitle,
  children,
  className = '',
  onClick,
  onKeyDown,
  variant = 'default',
  role,
  tabIndex,
  ariaLabel,
}) {
  const cardClass = `card card--${variant} ${onClick ? 'card--clickable' : ''} ${className}`;

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div
      className={cardClass}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : onKeyDown}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? (tabIndex ?? 0) : tabIndex}
      aria-label={ariaLabel}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

export default Card;
