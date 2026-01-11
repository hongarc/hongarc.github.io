import { GitCompare } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, success } from '@/utils';

const MODE_OPTIONS = ['line', 'word', 'char'] as const;
const VIEW_OPTIONS = ['inline', 'side-by-side'] as const;

type DiffType = 'equal' | 'insert' | 'delete';

interface DiffPart {
  type: DiffType;
  value: string;
}

// Pure function: compute longest common subsequence length table
const lcsTable = (a: string[], b: string[]): number[][] => {
  const m = a.length;
  const n = b.length;
  const table: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const row = table[i];
      if (row) {
        row[j] =
          a[i - 1] === b[j - 1]
            ? (table[i - 1]?.[j - 1] ?? 0) + 1
            : Math.max(table[i - 1]?.[j] ?? 0, row[j - 1] ?? 0);
      }
    }
  }

  return table;
};

// Pure function: backtrack to find diff
const backtrack = (table: number[][], a: string[], b: string[]): DiffPart[] => {
  const result: DiffPart[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', value: a[i - 1] ?? '' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || (table[i]?.[j - 1] ?? 0) >= (table[i - 1]?.[j] ?? 0))) {
      result.unshift({ type: 'insert', value: b[j - 1] ?? '' });
      j--;
    } else if (i > 0) {
      result.unshift({ type: 'delete', value: a[i - 1] ?? '' });
      i--;
    }
  }

  return result;
};

// Pure function: compute diff
const computeDiff = (oldText: string[], newText: string[]): DiffPart[] => {
  const table = lcsTable(oldText, newText);
  return backtrack(table, oldText, newText);
};

// Pure function: merge consecutive same-type parts
const mergeParts = (parts: DiffPart[], separator = ''): DiffPart[] => {
  if (parts.length === 0) return [];

  const merged: DiffPart[] = [];
  let current = { ...parts[0] } as DiffPart;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part?.type === current.type) {
      current.value += separator + part.value;
    } else if (part) {
      merged.push(current);
      current = { ...part };
    }
  }
  merged.push(current);

  return merged;
};

// Pure function: split text based on mode
const splitText = (text: string, mode: (typeof MODE_OPTIONS)[number]): string[] => {
  switch (mode) {
    case 'line': {
      return text.split('\n');
    }
    case 'word': {
      return text.split(/(\s+)/);
    }
    case 'char': {
      // eslint-disable-next-line unicorn/prefer-spread -- Safe for ASCII
      return text.split('');
    }
  }
};

// Pure function: format diff output
const formatDiff = (parts: DiffPart[], mode: (typeof MODE_OPTIONS)[number]): string => {
  const lines: string[] = [];

  for (const part of parts) {
    const prefix = part.type === 'insert' ? '+ ' : part.type === 'delete' ? '- ' : '  ';

    if (mode === 'line') {
      const partLines = part.value.split('\n');
      for (const line of partLines) {
        if (line || part.type !== 'equal') {
          lines.push(`${prefix}${line}`);
        }
      }
    } else {
      if (part.type === 'equal') {
        lines.push(part.value);
      } else {
        lines.push(`[${part.type === 'insert' ? '+' : '-'}${part.value}]`);
      }
    }
  }

  return mode === 'line' ? lines.join('\n') : lines.join('');
};

// Pure function: count changes (line-based for line mode)
const countChanges = (
  parts: DiffPart[],
  mode: (typeof MODE_OPTIONS)[number]
): { insertions: number; deletions: number } => {
  let insertions = 0;
  let deletions = 0;

  for (const part of parts) {
    if (mode === 'line') {
      const lineCount = part.value.split('\n').filter(Boolean).length || 1;
      if (part.type === 'insert') insertions += lineCount;
      if (part.type === 'delete') deletions += lineCount;
    } else {
      if (part.type === 'insert') insertions += part.value.length;
      if (part.type === 'delete') deletions += part.value.length;
    }
  }

  return { insertions, deletions };
};

// Pure function: convert diff parts to line-by-line view for visual display
interface DiffLine {
  type: 'equal' | 'insert' | 'delete';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

const toDiffLines = (parts: DiffPart[]): DiffLine[] => {
  const lines: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const part of parts) {
    const partLines = part.value.split('\n');

    for (const [idx, content] of partLines.entries()) {
      // Skip empty last element from split (trailing newline)
      if (idx === partLines.length - 1 && content === '' && partLines.length > 1) {
        continue;
      }

      if (part.type === 'equal') {
        lines.push({ type: 'equal', content, oldLineNum, newLineNum });
        oldLineNum++;
        newLineNum++;
      } else if (part.type === 'delete') {
        lines.push({ type: 'delete', content, oldLineNum });
        oldLineNum++;
      } else {
        lines.push({ type: 'insert', content, newLineNum });
        newLineNum++;
      }
    }
  }

  return lines;
};

export const textDiff: ToolPlugin = {
  id: 'text-diff',
  label: 'Text Diff',
  description: 'Compare two texts and show differences',
  category: 'text',
  icon: <GitCompare className="h-4 w-4" />,
  keywords: ['diff', 'compare', 'difference', 'merge', 'text', 'changes'],
  inputs: [
    {
      id: 'oldText',
      label: 'Original Text',
      type: 'textarea',
      placeholder: 'Enter original text...',
      required: true,
      rows: 8,
      group: 'compare',
    },
    {
      id: 'newText',
      label: 'New Text',
      type: 'textarea',
      placeholder: 'Enter new text...',
      required: true,
      rows: 8,
      group: 'compare',
    },
    {
      id: 'mode',
      label: 'Compare By',
      type: 'select',
      defaultValue: 'line',
      options: [
        { value: 'line', label: 'Lines' },
        { value: 'word', label: 'Words' },
        { value: 'char', label: 'Chars' },
      ],
    },
    {
      id: 'diffView',
      label: 'View',
      type: 'select',
      defaultValue: 'side-by-side',
      options: [
        { value: 'side-by-side', label: 'Side by Side' },
        { value: 'inline', label: 'Inline' },
      ],
    },
  ],
  transformer: (inputs) => {
    const oldText = (inputs.oldText as string | undefined) ?? '';
    const newText = (inputs.newText as string | undefined) ?? '';
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'line');
    const diffView = getSelectInput(inputs, 'diffView', VIEW_OPTIONS, 'side-by-side');

    if (!oldText && !newText) {
      return failure('Please enter text to compare');
    }

    const oldParts = splitText(oldText, mode);
    const newParts = splitText(newText, mode);

    // Get separator based on mode
    const separator = mode === 'line' ? '\n' : '';

    const diff = computeDiff(oldParts, newParts);
    const merged = mergeParts(diff, separator);
    const { insertions, deletions } = countChanges(merged, mode);

    // Generate text output for copy functionality
    const output = formatDiff(merged, mode);

    // For line mode, use visual diff view
    if (mode === 'line') {
      const diffLines = toDiffLines(merged);
      return success(output, {
        insertions,
        deletions,
        mode,
        _viewMode: 'diff',
        _diffData: {
          lines: diffLines,
          stats: { insertions, deletions },
          viewMode: diffView,
        },
      });
    }

    // For word/char mode, use text output
    return success(output, {
      insertions,
      deletions,
      mode,
    });
  },
};
