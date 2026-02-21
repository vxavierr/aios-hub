import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Card title="Card Title">
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <Card title="Title" subtitle="Card subtitle">
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText('Card subtitle')).toBeInTheDocument();
  });

  it('applies clickable class when onClick is provided', () => {
    const { container } = render(
      <Card onClick={() => {}}>
        <p>Clickable</p>
      </Card>
    );
    expect(container.querySelector('.card--clickable')).toBeInTheDocument();
  });

  it('applies variant class correctly', () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Elevated</p>
      </Card>
    );
    expect(container.querySelector('.card--elevated')).toBeInTheDocument();
  });

  it('applies default variant when no variant is specified', () => {
    const { container } = render(
      <Card>
        <p>Default</p>
      </Card>
    );
    expect(container.querySelector('.card--default')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Custom</p>
      </Card>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
