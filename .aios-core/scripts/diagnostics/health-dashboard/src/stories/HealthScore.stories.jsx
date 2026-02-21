import HealthScore from '../components/HealthScore';

/** Health score circular progress indicator with statistics. */
export default {
  title: 'Components/HealthScore',
  component: HealthScore,
  tags: ['autodocs'],
  argTypes: {
    score: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Health score value (0-100)',
    },
    totalIssues: {
      control: { type: 'number', min: 0 },
      description: 'Total number of issues',
    },
    criticalCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of critical issues',
    },
    highCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of high severity issues',
    },
    mediumCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of medium severity issues',
    },
    lowCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of low severity issues',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const Perfect = {
  args: {
    score: 100,
    totalIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  },
};

export const Healthy = {
  args: {
    score: 85,
    totalIssues: 5,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 2,
    lowCount: 3,
  },
};

export const Degraded = {
  args: {
    score: 65,
    totalIssues: 15,
    criticalCount: 0,
    highCount: 3,
    mediumCount: 5,
    lowCount: 7,
  },
};

export const Warning = {
  args: {
    score: 45,
    totalIssues: 30,
    criticalCount: 2,
    highCount: 8,
    mediumCount: 10,
    lowCount: 10,
  },
};

export const Critical = {
  args: {
    score: 15,
    totalIssues: 50,
    criticalCount: 10,
    highCount: 15,
    mediumCount: 15,
    lowCount: 10,
  },
};

export const Zero = {
  args: {
    score: 0,
    totalIssues: 100,
    criticalCount: 50,
    highCount: 30,
    mediumCount: 15,
    lowCount: 5,
  },
};
