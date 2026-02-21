import { Component } from 'react';

/**
 * Error Boundary component for catching React errors
 * and displaying a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Could send to error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false } = this.props;

      // Custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback(this.state.error, this.handleRetry)
          : fallback;
      }

      // Default error UI
      return (
        <div
          className="error-boundary"
          style={styles.container}
          role="alert"
        >
          <div style={styles.icon} aria-hidden="true">
            ⚠️
          </div>
          <h2 style={styles.title}>Something went wrong</h2>
          <p style={styles.message}>
            {this.props.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {showDetails && this.state.error && (
            <details style={styles.details}>
              <summary style={styles.summary}>Error Details</summary>
              <pre style={styles.errorText}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={styles.retryButton}
            aria-label="Retry loading content"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    minHeight: '200px',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    color: 'var(--color-critical)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-semibold)',
    margin: '0 0 0.5rem 0',
  },
  message: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-base)',
    margin: '0 0 1.5rem 0',
    maxWidth: '400px',
  },
  details: {
    marginBottom: '1.5rem',
    maxWidth: '100%',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-sm)',
  },
  errorText: {
    backgroundColor: 'var(--color-bg-primary)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    overflow: 'auto',
    maxWidth: '500px',
    color: 'var(--color-critical)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  retryButton: {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    backgroundColor: 'var(--color-info)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
    minHeight: '44px',
    minWidth: '44px',
  },
};

export default ErrorBoundary;
