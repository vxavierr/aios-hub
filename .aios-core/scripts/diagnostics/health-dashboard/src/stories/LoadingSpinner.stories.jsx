import LoadingSpinner from '../components/LoadingSpinner';

/** Loading spinner for async operations. */
export default {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spinner size',
    },
    message: {
      control: 'text',
      description: 'Loading message to display',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {},
};

export const WithMessage = {
  args: {
    message: 'Loading data...',
  },
};

export const Small = {
  args: {
    size: 'sm',
    message: 'Small spinner',
  },
};

export const Large = {
  args: {
    size: 'lg',
    message: 'Large spinner',
  },
};

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <LoadingSpinner size="sm" message="Small" />
      <LoadingSpinner size="md" message="Medium" />
      <LoadingSpinner size="lg" message="Large" />
    </div>
  ),
};
