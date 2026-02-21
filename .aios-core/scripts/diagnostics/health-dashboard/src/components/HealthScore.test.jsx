import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthScore from './HealthScore';

describe('HealthScore', () => {
  it('renders score value correctly', () => {
    render(<HealthScore score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders label correctly', () => {
    render(<HealthScore score={85} label="Health" />);
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('applies healthy class for score >= 90', () => {
    const { container } = render(<HealthScore score={95} />);
    expect(container.querySelector('.health-score-label--healthy')).toBeInTheDocument();
  });

  it('applies degraded class for score 70-89', () => {
    const { container } = render(<HealthScore score={75} />);
    expect(container.querySelector('.health-score-label--degraded')).toBeInTheDocument();
  });

  it('applies warning class for score 50-69', () => {
    const { container } = render(<HealthScore score={60} />);
    expect(container.querySelector('.health-score-label--warning')).toBeInTheDocument();
  });

  it('applies critical class for score < 50', () => {
    const { container } = render(<HealthScore score={30} />);
    expect(container.querySelector('.health-score-label--critical')).toBeInTheDocument();
  });

  it('applies size class for sm', () => {
    const { container } = render(<HealthScore score={85} size="sm" />);
    expect(container.querySelector('.health-score--sm')).toBeInTheDocument();
  });

  it('applies size class for md', () => {
    const { container } = render(<HealthScore score={85} size="md" />);
    expect(container.querySelector('.health-score--md')).toBeInTheDocument();
  });

  it('applies size class for xl', () => {
    const { container } = render(<HealthScore score={85} size="xl" />);
    expect(container.querySelector('.health-score--xl')).toBeInTheDocument();
  });
});
