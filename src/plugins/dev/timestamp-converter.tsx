import { Clock } from 'lucide-react';

import { parseTimestampInput } from '@/domain/time/timestamp';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getStringInput, success } from '@/utils';

// Pure function: format date to various formats
interface DateFormats {
  iso: string;
  utc: string;
  local: string;
  relative: string;
  unixSeconds: number;
  unixMs: number;
}

const getDateFormats = (date: Date): DateFormats => ({
  iso: date.toISOString(),
  utc: date.toUTCString(),
  local: date.toLocaleString(),
  relative: getRelativeTime(date),
  unixSeconds: Math.floor(date.getTime() / 1000),
  unixMs: date.getTime(),
});

// Pure function: get relative time string
const getRelativeTime = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let value: string;
  if (years > 0) value = `${String(years)} year${years > 1 ? 's' : ''}`;
  else if (months > 0) value = `${String(months)} month${months > 1 ? 's' : ''}`;
  else if (days > 0) value = `${String(days)} day${days > 1 ? 's' : ''}`;
  else if (hours > 0) value = `${String(hours)} hour${hours > 1 ? 's' : ''}`;
  else if (minutes > 0) value = `${String(minutes)} minute${minutes > 1 ? 's' : ''}`;
  else value = `${String(seconds)} second${seconds === 1 ? '' : 's'}`;

  return isPast ? `${value} ago` : `in ${value}`;
};

export const timestampConverter: ToolPlugin = {
  id: 'timestamp',
  label: 'Timestamp Converter',
  description: 'Convert Unix timestamp to date and date to timestamp online',
  category: 'dev',
  icon: <Clock className="h-4 w-4" />,
  keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
  preferFresh: true,
  inputs: [
    {
      id: 'input',
      label: 'Timestamp or Date',
      type: 'text',
      placeholder: 'Enter Unix timestamp (e.g., 1704067200) or date (e.g., 2024-01-01)',
      helpText: 'Leave empty to show current time',
    },
  ],
  transformer: (inputs) => {
    const input = getStringInput(inputs, 'input');

    // If no input, show current timestamp
    const date = !input || input.trim() === '' ? new Date() : parseTimestampInput(input);

    if (!date) {
      return failure('Invalid timestamp or date format');
    }

    try {
      const formats = getDateFormats(date);
      const timestamps = [
        `Unix (s):  ${String(formats.unixSeconds)}`,
        `Unix (ms): ${String(formats.unixMs)}`,
      ].join('\n');

      return success(timestamps, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            {
              label: 'ISO 8601',
              value: formats.iso,
              tooltip: 'International standard format. Best for APIs and data exchange.',
            },
            {
              label: 'UTC',
              value: formats.utc,
              tooltip: 'Coordinated Universal Time. No timezone offset.',
            },
            {
              label: 'Local',
              value: formats.local,
              tooltip: 'Formatted for your browser timezone.',
            },
            { label: 'Relative', value: formats.relative },
          ],
          content: timestamps,
          contentLabel: 'Unix Timestamps',
        },
      });
    } catch {
      return failure('Failed to convert timestamp');
    }
  },
};
