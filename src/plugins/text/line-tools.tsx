import { List } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getSelectInput, success } from '@/utils';

const ACTION_OPTIONS = ['sort', 'dedupe', 'reverse', 'shuffle'] as const;

// Pure function: sort lines
const sortLines = (lines: string[], caseSensitive: boolean): string[] => {
  const sorted: string[] = [...lines];
  sorted.sort((a, b) => {
    const compareA = caseSensitive ? a : a.toLowerCase();
    const compareB = caseSensitive ? b : b.toLowerCase();
    return compareA.localeCompare(compareB);
  });
  return sorted;
};

// Pure function: remove duplicates
const dedupeLines = (lines: string[], caseSensitive: boolean): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  return result;
};

// Pure function: reverse lines
const reverseLines = (lines: string[]): string[] => {
  const reversed: string[] = [...lines];
  reversed.reverse();
  return reversed;
};

// Pure function: shuffle lines (Fisher-Yates)
const shuffleLines = (lines: string[]): string[] => {
  const result = [...lines];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j] ?? '';
    result[j] = temp ?? '';
  }
  return result;
};

export const lineTools: ToolPlugin = {
  id: 'lines',
  label: 'Line Tools',
  description: 'Sort, dedupe, reverse, and shuffle text lines online',
  category: 'text',
  icon: <List className="h-4 w-4" />,
  keywords: ['sort', 'dedupe', 'unique', 'reverse', 'shuffle', 'lines', 'list'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Enter lines of text...',
      required: true,
      rows: 8,
    },
    {
      id: 'action',
      label: 'Action',
      type: 'select',
      defaultValue: 'sort',
      options: [
        { value: 'sort', label: 'Sort' },
        { value: 'dedupe', label: 'Dedupe' },
        { value: 'reverse', label: 'Reverse' },
        { value: 'shuffle', label: 'Shuffle' },
      ],
    },
    {
      id: 'caseSensitive',
      label: 'Case sensitive',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'trimLines',
      label: 'Trim lines',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      id: 'removeEmpty',
      label: 'Remove empty',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  transformer: (inputs) => {
    const input = (inputs.input as string | undefined) ?? '';
    const action = getSelectInput(inputs, 'action', ACTION_OPTIONS, 'sort');
    const caseSensitive = getBooleanInput(inputs, 'caseSensitive');
    const trimLines = getBooleanInput(inputs, 'trimLines');
    const removeEmpty = getBooleanInput(inputs, 'removeEmpty');

    if (!input.trim()) {
      return failure('Please enter some text');
    }

    // Split into lines and optionally process
    let lines = input.split('\n');

    if (trimLines) {
      lines = lines.map((l) => l.trim());
    }

    if (removeEmpty) {
      lines = lines.filter((l) => l.length > 0);
    }

    const originalCount = lines.length;

    // Apply action
    let result: string[];
    switch (action) {
      case 'sort': {
        result = sortLines(lines, caseSensitive);
        break;
      }
      case 'dedupe': {
        result = dedupeLines(lines, caseSensitive);
        break;
      }
      case 'reverse': {
        result = reverseLines(lines);
        break;
      }
      case 'shuffle': {
        result = shuffleLines(lines);
        break;
      }
    }

    const output = result.join('\n');
    const removedCount = action === 'dedupe' ? originalCount - result.length : 0;
    const actionLabels: Record<typeof action, string> = {
      sort: 'Sorted',
      dedupe: 'Deduplicated',
      reverse: 'Reversed',
      shuffle: 'Shuffled',
    };

    const stats: { label: string; value: string }[] = [
      { label: 'Action', value: actionLabels[action] },
      { label: 'Lines', value: String(result.length) },
    ];

    if (action === 'dedupe') {
      stats.push({ label: 'Removed', value: String(removedCount) });
    }

    return success(output, {
      _viewMode: 'sections',
      _sections: {
        stats,
        content: output,
        contentLabel: 'Result',
      },
    });
  },
};
