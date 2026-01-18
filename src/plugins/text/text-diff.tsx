import { diffWords, diffLines } from 'diff';
import { GitCompare } from 'lucide-react';
import { pipe, map, filter, reduce, join, trim, reject, curry, equals } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, success } from '@/utils';

interface WordDiff {
  type: 'equal' | 'added' | 'removed';
  value: string;
}

interface LineDiffResult {
  type: 'equal' | 'added' | 'removed';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
  wordDiffs?: WordDiff[];
}

// Pure function: transform diff change to WordDiff using Ramda
const transformDiffChange = (change: {
  added?: boolean;
  removed?: boolean;
  value: string;
}): WordDiff => ({
  type: change.added ? 'added' : change.removed ? 'removed' : 'equal',
  value: change.value,
});

// Pure function: compute word-level diff for a line pair using Ramda
const computeWordDiff = pipe(
  ({ oldLine, newLine }: { oldLine: string; newLine: string }) => diffWords(oldLine, newLine),
  map(transformDiffChange)
);

// Pure function: filter out word diffs by type using Ramda
const filterWordDiffsByType = curry((excludeType: string, wordDiffs: WordDiff[]) =>
  reject((diff: WordDiff) => equals(excludeType, diff.type), wordDiffs)
);

// Pure function: process lines and add word-level diffs
const processLinesWithWordDiff = (oldText: string, newText: string): LineDiffResult[] => {
  const diffResults = diffLines(oldText, newText);
  const lines: LineDiffResult[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  // Convert diff results to line results
  for (const result of diffResults) {
    const resultLines = result.value.split('\n');

    for (let i = 0; i < resultLines.length; i++) {
      const content = resultLines[i] ?? '';

      // Skip empty last element from split (trailing newline)
      if (i === resultLines.length - 1 && content === '' && resultLines.length > 1) {
        continue;
      }

      if (result.added) {
        lines.push({
          type: 'added',
          content,
          newLineNum,
        });
        newLineNum++;
      } else if (result.removed) {
        lines.push({
          type: 'removed',
          content,
          oldLineNum,
        });
        oldLineNum++;
      } else {
        lines.push({
          type: 'equal',
          content,
          oldLineNum,
          newLineNum,
        });
        oldLineNum++;
        newLineNum++;
      }
    }
  }

  // Add word-level diffs for adjacent removed/added pairs
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    if (current?.type === 'removed' && next?.type === 'added') {
      const wordDiffs = computeWordDiff({
        oldLine: current.content,
        newLine: next.content,
      });

      // Split word diffs between removed and added lines using Ramda
      current.wordDiffs = filterWordDiffsByType('added', wordDiffs);
      next.wordDiffs = filterWordDiffsByType('removed', wordDiffs);

      i++; // Skip next line as we processed the pair
    }
  }

  return lines;
};

// Pure function: format diff output using Ramda
const formatDiffOutput = pipe(
  map((line: LineDiffResult) => {
    const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
    return `${prefix}${line.content}`;
  }),
  join('\n')
);

// Pure function: count changes using Ramda
const countChanges = pipe(
  filter((line: LineDiffResult) => line.type !== 'equal'),
  reduce(
    (acc: { insertions: number; deletions: number }, line: LineDiffResult) => ({
      insertions: acc.insertions + (line.type === 'added' ? 1 : 0),
      deletions: acc.deletions + (line.type === 'removed' ? 1 : 0),
    }),
    { insertions: 0, deletions: 0 }
  )
);

// Pure function: sanitize input text using Ramda
const sanitizeInput = pipe((text: string | undefined) => text ?? '', trim);

const VIEW_OPTIONS = ['inline', 'side-by-side'] as const;

export const textDiff: ToolPlugin = {
  id: 'diff',
  label: 'Text Diff',
  description: 'Compare two texts and highlight differences online',
  category: 'text',
  icon: <GitCompare className="h-4 w-4" />,
  keywords: ['diff', 'compare', 'difference', 'merge', 'text', 'changes', 'line', 'word'],
  inputs: [
    {
      id: 'oldText',
      label: 'Original Text',
      type: 'textarea',
      placeholder: 'Enter original text...',
      required: true,
      rows: 8,
      group: 'compare',
      sensitive: true,
    },
    {
      id: 'newText',
      label: 'New Text',
      type: 'textarea',
      placeholder: 'Enter new text...',
      required: true,
      rows: 8,
      group: 'compare',
      sensitive: true,
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
    const oldText = sanitizeInput(inputs.oldText as string | undefined);
    const newText = sanitizeInput(inputs.newText as string | undefined);
    const diffView = getSelectInput(inputs, 'diffView', VIEW_OPTIONS, 'side-by-side');

    if (!oldText && !newText) {
      return failure('Please enter text to compare');
    }

    // Process lines and add word-level diffs using Ramda
    const processedLines = processLinesWithWordDiff(oldText, newText);

    // Generate statistics using Ramda
    const stats = countChanges(processedLines);

    // Format output for copy functionality using Ramda
    const output = formatDiffOutput(processedLines);

    return success(output, {
      insertions: stats.insertions,
      deletions: stats.deletions,
      mode: 'line',
      _viewMode: 'diff',
      _diffData: {
        lines: processedLines,
        stats,
        viewMode: diffView,
        hasWordHighlighting: true,
      },
    });
  },
};
