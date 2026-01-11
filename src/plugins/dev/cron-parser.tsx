import { Clock } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

// Pure function: parse cron expression
const parseCron = (expression: string): CronParts | null => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  return {
    minute: parts[0] ?? '*',
    hour: parts[1] ?? '*',
    dayOfMonth: parts[2] ?? '*',
    month: parts[3] ?? '*',
    dayOfWeek: parts[4] ?? '*',
  };
};

// Pure function: describe a cron field
const describeField = (value: string, fieldName: string, names?: string[]): string => {
  if (value === '*') return `every ${fieldName}`;
  if (value === '?') return `any ${fieldName}`;

  // Handle step values (*/5, 1-10/2)
  if (value.includes('/')) {
    const parts = value.split('/');
    const range = parts[0] ?? '*';
    const step = parts[1] ?? '1';
    if (range === '*') {
      return `every ${step} ${fieldName}s`;
    }
    return `every ${step} ${fieldName}s in range ${range}`;
  }

  // Handle ranges (1-5)
  if (value.includes('-') && !value.includes(',')) {
    const parts = value.split('-');
    const start = parts[0] ?? '0';
    const end = parts[1] ?? '0';
    const startName = names?.[Number(start)] ?? start;
    const endName = names?.[Number(end)] ?? end;
    return `from ${startName} to ${endName}`;
  }

  // Handle lists (1,3,5)
  if (value.includes(',')) {
    const items = value.split(',').map((v) => names?.[Number(v)] ?? v);
    return items.join(', ');
  }

  // Single value
  return names?.[Number(value)] ?? value;
};

// Field name mappings
const MONTHS = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Pure function: generate human-readable summary
const generateSummary = (parts: CronParts): string => {
  const summaryParts: string[] = [];

  // Time
  if (parts.minute === '*' && parts.hour === '*') {
    summaryParts.push('Every minute');
  } else if (parts.minute === '0' && parts.hour === '*') {
    summaryParts.push('Every hour');
  } else if (parts.minute === '*') {
    summaryParts.push(`Every minute of hour ${parts.hour}`);
  } else if (parts.hour === '*') {
    summaryParts.push(`At minute ${parts.minute} of every hour`);
  } else {
    const hour = Number(parts.hour);
    const minute = parts.minute.padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    summaryParts.push(`At ${String(displayHour)}:${minute} ${ampm}`);
  }

  // Day restrictions
  if (parts.dayOfMonth !== '*' && parts.dayOfWeek !== '*') {
    summaryParts.push(
      `on day ${parts.dayOfMonth} and ${describeField(parts.dayOfWeek, 'day', DAYS)}`
    );
  } else if (parts.dayOfMonth !== '*') {
    summaryParts.push(`on day ${parts.dayOfMonth} of the month`);
  } else if (parts.dayOfWeek !== '*') {
    summaryParts.push(`on ${describeField(parts.dayOfWeek, 'day', DAYS)}`);
  }

  // Month restrictions
  if (parts.month !== '*') {
    summaryParts.push(`in ${describeField(parts.month, 'month', MONTHS)}`);
  }

  return summaryParts.join(' ');
};

// Pure function: get next run times
const getNextRuns = (parts: CronParts, count = 5): string[] => {
  // Simple implementation for common cases
  const runs: string[] = [];
  const now = new Date();

  for (let i = 0; i < count * 100 && runs.length < count; i++) {
    const candidate = new Date(now.getTime() + i * 60 * 1000);

    const minute = candidate.getMinutes();
    const hour = candidate.getHours();
    const dayOfMonth = candidate.getDate();
    const month = candidate.getMonth() + 1;
    const dayOfWeek = candidate.getDay();

    const matchesMinute = parts.minute === '*' || matchesValue(parts.minute, minute);
    const matchesHour = parts.hour === '*' || matchesValue(parts.hour, hour);
    const matchesDom = parts.dayOfMonth === '*' || matchesValue(parts.dayOfMonth, dayOfMonth);
    const matchesMonth = parts.month === '*' || matchesValue(parts.month, month);
    const matchesDow = parts.dayOfWeek === '*' || matchesValue(parts.dayOfWeek, dayOfWeek);

    if (matchesMinute && matchesHour && matchesDom && matchesMonth && matchesDow) {
      const formatted = candidate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      runs.push(formatted);
    }
  }

  return runs;
};

// Helper: check if value matches cron field
const matchesValue = (field: string, value: number): boolean => {
  if (field.includes('/')) {
    const [, step] = field.split('/');
    return value % Number(step) === 0;
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-');
    return value >= Number(start) && value <= Number(end);
  }
  if (field.includes(',')) {
    return field.split(',').map(Number).includes(value);
  }
  return Number(field) === value;
};

export const cronParser: ToolPlugin = {
  id: 'cron-parser',
  label: 'Cron Parser',
  description: 'Parse and explain cron expressions',
  category: 'dev',
  icon: <Clock className="h-4 w-4" />,
  keywords: ['cron', 'schedule', 'crontab', 'job', 'timer', 'expression'],
  inputs: [
    {
      id: 'input',
      label: 'Cron Expression',
      type: 'text',
      placeholder: '0 9 * * 1-5',
      required: true,
      helpText: 'Format: minute hour day-of-month month day-of-week',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');

    if (!input) {
      return failure('Please enter a cron expression');
    }

    const parts = parseCron(input);
    if (!parts) {
      return failure('Invalid cron format. Expected: minute hour day-of-month month day-of-week');
    }

    const summary = generateSummary(parts);
    const nextRuns = getNextRuns(parts);
    const nextRunsContent = nextRuns.join('\n');

    return success(nextRunsContent, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'Expression', value: input },
          { label: 'Summary', value: summary },
          { label: 'Minute', value: parts.minute },
          { label: 'Hour', value: parts.hour },
          { label: 'Day', value: parts.dayOfMonth },
          { label: 'Month', value: parts.month },
          { label: 'Weekday', value: parts.dayOfWeek },
        ],
        content: nextRunsContent,
        contentLabel: 'Next Runs',
      },
    });
  },
};
