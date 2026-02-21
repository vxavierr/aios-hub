import { useState } from 'react';

/**
 * ErrorMessage component for displaying errors with retry functionality.
 */
export default function ErrorMessage({
  title = 'Error Loading Data',
  message,
  error,
  onRetry,
  showDetails = false,
  variant = 'card', // 'card' | 'inline' | 'toast'
}) {
  const [showError, setShowError] = useState(false);

  const variants = {
    card: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        borderLeft: '4px solid var(--color-critical)',
        minHeight: '200px',
      },
    },
    inline: {
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-critical)',
      },
    },
    toast: {
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-critical)',
      },
    },
  };

  const styles = variants[variant];

  return (
    <div
      className="error-message"
      style={styles.container}
      role="alert"
      aria-live="assertive"
    >
      <div
        style={{
          fontSize: variant === 'inline' ? '1.5rem' : '2.5rem',
          marginBottom: variant === 'inline' ? 0 : 'var(--spacing-md)',
        }}
        aria-hidden="true"
      >
        ❌
      </div>

      <div style={{ flex: 1, textAlign: variant === 'inline' ? 'left' : 'center' }}>
        <h3
          style={{
            color: 'var(--color-critical)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--spacing-xs) 0',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            margin: 0,
          }}
        >
          {message || 'Unable to load the requested data. Please try again.'}
        </p>

        {showDetails && error && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <button
              onClick={() => setShowError(!showError)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-info)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                padding: 0,
              }}
              aria-expanded={showError}
            >
              {showError ? 'Hide' : 'Show'} technical details
            </button>

            {showError && (
              <pre
                style={{
                  marginTop: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  overflow: 'auto',
                  color: 'var(--color-text-muted)',
                  textAlign: 'left',
                  maxWidth: '100%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {typeof error === 'string' ? error : error.message || JSON.stringify(error, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            backgroundColor: 'var(--color-critical)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast)',
            minHeight: '44px',
            marginTop: variant === 'inline' ? 0 : 'var(--spacing-md)',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
          aria-label="Retry loading data"
        >
          Retry
        </button>
      )}
    </div>
  );
}
