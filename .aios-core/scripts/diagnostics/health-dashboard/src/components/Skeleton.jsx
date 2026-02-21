/**
 * Skeleton component for loading placeholders.
 * Mimics the shape of content while loading.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  animation = 'pulse',
  className = '',
  style = {},
}) {
  const baseStyles = {
    backgroundColor: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    display: 'block',
    ...style,
  };

  const variantStyles = {
    text: {
      height: height || '1em',
      width: width || '100%',
    },
    circular: {
      height: height || '40px',
      width: width || '40px',
      borderRadius: '50%',
    },
    rectangular: {
      height: height || '100px',
      width: width || '100%',
      borderRadius: 'var(--radius-md)',
    },
    card: {
      height: height || '200px',
      width: width || '100%',
      borderRadius: 'var(--radius-lg)',
    },
  };

  const animationStyles = {
    pulse: {
      animation: 'skeleton-pulse 2s ease-in-out infinite',
    },
    wave: {
      animation: 'skeleton-wave 2s linear infinite',
      background: 'linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-bg-card) 50%, var(--color-bg-elevated) 75%)',
      backgroundSize: '200% 100%',
    },
    none: {},
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...animationStyles[animation],
  };

  // Add keyframes to document if not already added
  if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'skeleton-styles';
    styleSheet.textContent = `
      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes skeleton-wave {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  if (count > 1) {
    return (
      <div className={`skeleton-group ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={index}
            className={`skeleton skeleton-${variant} ${className}`}
            style={{
              ...combinedStyles,
              marginBottom: index < count - 1 ? 'var(--spacing-sm)' : 0,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={`skeleton skeleton-${variant} ${className}`}
      style={combinedStyles}
      aria-hidden="true"
    />
  );
}

// Skeleton presets for common use cases
export function CardSkeleton({ count = 1 }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <Skeleton variant="text" width="60%" height="1.5rem" style={{ marginBottom: 'var(--spacing-sm)' }} />
          <Skeleton variant="text" count={2} />
          <Skeleton variant="text" width="80%" style={{ marginTop: 'var(--spacing-sm)' }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height="1.5rem" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function HealthScoreSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-md)' }}>
      <Skeleton variant="circular" width="120px" height="120px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height="1.5rem" style={{ marginBottom: 'var(--spacing-sm)' }} />
        <Skeleton variant="text" count={3} />
      </div>
    </div>
  );
}
