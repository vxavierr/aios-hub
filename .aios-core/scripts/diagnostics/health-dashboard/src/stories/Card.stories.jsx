import Card from '../components/Card';

/** Card component for displaying content in a contained box with optional status indicator. */
export default {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Visual style variant',
    },
    status: {
      control: 'select',
      options: ['healthy', 'degraded', 'warning', 'critical', 'info'],
      description: 'Optional status indicator color',
    },
    onClick: { action: 'clicked' },
  },
  parameters: {
    design: {
      type: 'figma',
      url: '#',
    },
  },
};

export const Default = {
  args: {
    children: 'Card content goes here',
  },
};

export const Elevated = {
  args: {
    variant: 'elevated',
    children: 'Elevated card with shadow',
  },
};

export const Outlined = {
  args: {
    variant: 'outlined',
    children: 'Outlined card with border',
  },
};

export const WithStatus = {
  args: {
    status: 'healthy',
    children: 'Card with healthy status indicator',
  },
};

export const Critical = {
  args: {
    status: 'critical',
    children: 'Card with critical status indicator',
  },
};

export const WithTitle = {
  args: {
    status: 'warning',
    children: (
      <>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Card Title</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          Additional content with description text.
        </p>
      </>
    ),
  },
};

export const Clickable = {
  args: {
    variant: 'elevated',
    onClick: () => console.log('Card clicked'),
    children: 'Click me! This card is interactive.',
  },
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card>Default</Card>
      <Card variant="elevated">Elevated</Card>
      <Card variant="outlined">Outlined</Card>
      <Card status="healthy">Healthy</Card>
      <Card status="degraded">Degraded</Card>
      <Card status="warning">Warning</Card>
      <Card status="critical">Critical</Card>
    </div>
  ),
};
