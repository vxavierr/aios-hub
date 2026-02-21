import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

// Mock the useHealthData hook
vi.mock('../hooks/useHealthData', () => ({
  useHealthData: vi.fn(),
}));

// Mock the useAutoRefresh hook
vi.mock('../hooks/useAutoRefresh', () => ({
  useAutoRefresh: vi.fn(() => ({
    countdown: 30,
    isRunning: true,
    start: vi.fn(),
    stop: vi.fn(),
    toggle: vi.fn(),
  })),
}));

import { useHealthData } from '../hooks/useHealthData';

const mockHealthData = {
  score: 85,
  lastUpdated: '2024-01-15T10:30:00Z',
  domains: [
    {
      id: 'project',
      name: 'Project',
      icon: '📁',
      score: 90,
      checks: { passed: 9, failed: 1, skipped: 0 },
    },
  ],
  issues: {
    critical: 0,
    high: 2,
    medium: 5,
    low: 3,
  },
  techDebt: [],
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    useHealthData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByRole('status') || document.querySelector('.loading-spinner')).toBeTruthy();
  });

  it('shows error state when fetch fails', async () => {
    useHealthData.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      refetch: vi.fn(),
    });

    renderDashboard();
    expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeTruthy();
  });

  it('renders dashboard content when data is loaded', async () => {
    useHealthData.mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('AIOS Health Dashboard')).toBeInTheDocument();
  });

  it('displays health score correctly', async () => {
    useHealthData.mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays domain cards', async () => {
    useHealthData.mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  it('displays issue counts', async () => {
    useHealthData.mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    // Check for the issue section
    expect(screen.getByText(/issues/i)).toBeTruthy();
  });
});
