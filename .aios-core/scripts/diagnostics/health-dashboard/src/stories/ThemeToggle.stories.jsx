import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from '../context/ThemeContext';

/** Theme toggle button for switching between dark and light modes. */
export default {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export const Default = {};

export const InHeader = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '8px',
        minWidth: '300px',
      }}
    >
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
        Dashboard Header
      </span>
      <ThemeToggle />
    </div>
  ),
};
