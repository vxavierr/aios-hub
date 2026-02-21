import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  describe('status mode', () => {
    it('renders healthy status correctly', () => {
      const { container } = render(<StatusBadge status="healthy" />);
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(container.querySelector('.badge--healthy')).toBeInTheDocument();
    });

    it('renders critical status correctly', () => {
      const { container } = render(<StatusBadge status="critical" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(container.querySelector('.badge--critical')).toBeInTheDocument();
    });

    it('renders warning status correctly', () => {
      const { container } = render(<StatusBadge status="warning" />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(container.querySelector('.badge--warning')).toBeInTheDocument();
    });

    it('renders degraded status correctly', () => {
      const { container } = render(<StatusBadge status="degraded" />);
      expect(screen.getByText('Degraded')).toBeInTheDocument();
      expect(container.querySelector('.badge--degraded')).toBeInTheDocument();
    });

    it('renders passed status correctly', () => {
      const { container } = render(<StatusBadge status="passed" />);
      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(container.querySelector('.badge--passed')).toBeInTheDocument();
    });

    it('renders failed status correctly', () => {
      const { container } = render(<StatusBadge status="failed" />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(container.querySelector('.badge--failed')).toBeInTheDocument();
    });

    it('renders skipped status correctly', () => {
      const { container } = render(<StatusBadge status="skipped" />);
      expect(screen.getByText('Skipped')).toBeInTheDocument();
      expect(container.querySelector('.badge--skipped')).toBeInTheDocument();
    });
  });

  describe('severity mode', () => {
    it('renders CRITICAL severity correctly', () => {
      const { container } = render(<StatusBadge severity="CRITICAL" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(container.querySelector('.badge--severity-critical')).toBeInTheDocument();
    });

    it('renders HIGH severity correctly', () => {
      const { container } = render(<StatusBadge severity="HIGH" />);
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(container.querySelector('.badge--severity-high')).toBeInTheDocument();
    });

    it('renders MEDIUM severity correctly', () => {
      const { container } = render(<StatusBadge severity="MEDIUM" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(container.querySelector('.badge--severity-medium')).toBeInTheDocument();
    });

    it('renders LOW severity correctly', () => {
      const { container } = render(<StatusBadge severity="LOW" />);
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(container.querySelector('.badge--severity-low')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('applies sm size class', () => {
      const { container } = render(<StatusBadge status="healthy" size="sm" />);
      expect(container.querySelector('.badge--sm')).toBeInTheDocument();
    });

    it('applies md size class (default)', () => {
      const { container } = render(<StatusBadge status="healthy" size="md" />);
      expect(container.querySelector('.badge--md')).toBeInTheDocument();
    });

    it('applies lg size class', () => {
      const { container } = render(<StatusBadge status="healthy" size="lg" />);
      expect(container.querySelector('.badge--lg')).toBeInTheDocument();
    });
  });

  describe('icon visibility', () => {
    it('shows icon by default', () => {
      const { container } = render(<StatusBadge status="healthy" />);
      expect(container.querySelector('.badge-icon')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      const { container } = render(<StatusBadge status="healthy" showIcon={false} />);
      expect(container.querySelector('.badge-icon')).not.toBeInTheDocument();
    });
  });
});
