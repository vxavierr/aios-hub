import StatusBadge from '../components/StatusBadge';

/** Status badge for displaying health status with visual indicator. */
export default {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'degraded', 'warning', 'critical', 'info'],
      description: 'Status type to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show status icon',
    },
  },
};

export const Healthy = {
  args: {
    status: 'healthy',
    showIcon: true,
  },
};

export const Degraded = {
  args: {
    status: 'degraded',
    showIcon: true,
  },
};

export const Warning = {
  args: {
    status: 'warning',
    showIcon: true,
  },
};

export const Critical = {
  args: {
    status: 'critical',
    showIcon: true,
  },
};

export const Info = {
  args: {
    status: 'info',
    showIcon: true,
  },
};

export const NoIcon = {
  args: {
    status: 'healthy',
    showIcon: false,
  },
};

export const SmallSize = {
  args: {
    status: 'healthy',
    size: 'sm',
    showIcon: true,
  },
};

export const LargeSize = {
  args: {
    status: 'critical',
    size: 'lg',
    showIcon: true,
  },
};

export const AllStatuses = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <StatusBadge status="healthy" showIcon />
      <StatusBadge status="degraded" showIcon />
      <StatusBadge status="warning" showIcon />
      <StatusBadge status="critical" showIcon />
      <StatusBadge status="info" showIcon />
    </div>
  ),
};

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <StatusBadge status="healthy" size="sm" showIcon />
      <StatusBadge status="healthy" size="md" showIcon />
      <StatusBadge status="healthy" size="lg" showIcon />
    </div>
  ),
};
