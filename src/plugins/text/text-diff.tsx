import type { Change } from 'diff';
import { GitCompare } from 'lucide-react';
import { filter, join, map, pipe, piped, prop, reduce, sum } from 'remeda';

import { normalizeForDiff, type NormalizeDiffOptions } from '@/domain/text/normalize-diff';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getSelectInput, success } from '@/utils';

export interface WordDiff {
  type: 'equal' | 'added' | 'removed';
  value: string;
}

export interface LineDiffResult {
  type: 'equal' | 'added' | 'removed';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
  wordDiffs?: WordDiff[];
}

export interface DiffData {
  lines: LineDiffResult[];
  stats: { insertions: number; deletions: number };
  viewMode?: 'inline' | 'side-by-side';
  hasWordHighlighting?: boolean;
}

// Pure function: transform diff change to WordDiff
const transformDiffChange = (change: {
  added?: boolean;
  removed?: boolean;
  value: string;
}): WordDiff => ({
  type: change.added ? 'added' : change.removed ? 'removed' : 'equal',
  value: change.value,
});

/**
 * The 'diff' package is only needed by this tool, so it is imported on first
 * comparison instead of being bundled into the entry chunk. The module is
 * cached, so repeated comparisons pay the cost once.
 */
const loadDiff = () => import('diff');
let diffModulePromise: ReturnType<typeof loadDiff> | null = null;
const getDiff = (): ReturnType<typeof loadDiff> => {
  diffModulePromise ??= loadDiff();
  return diffModulePromise;
};

type DiffWordsFn = (oldStr: string, newStr: string) => Change[];

// Pure function: compute word-level diff for a line pair
const computeWordDiff = (diffWords: DiffWordsFn) =>
  piped(
    ({ oldLine, newLine }: { oldLine: string; newLine: string }) => diffWords(oldLine, newLine),
    map(transformDiffChange)
  );

// Pure function: filter out word diffs by type
const filterWordDiffsByType = (excludeType: string, wordDiffs: WordDiff[]): WordDiff[] =>
  filter(wordDiffs, (diff) => diff.type !== excludeType);

// Pure function: compute similarity ratio between two lines via word diff
// Returns 0..1 where 1 means identical, 0 means completely different
const computeSimilarity = (wordDiffs: WordDiff[]): number => {
  const lengths = map(
    wordDiffs,
    piped(prop('value'), (v: string) => v.length)
  );
  const totalLen = sum(lengths);
  if (totalLen === 0) return 0;
  const equalLen = sum(map(wordDiffs, (d) => (d.type === 'equal' ? d.value.length : 0)));
  return equalLen / totalLen;
};

// Below 30% shared content, paired lines are too dissimilar for word-level
// highlighting to be useful — it just highlights nearly everything as changed.
const WORD_DIFF_SIMILARITY_THRESHOLD = 0.3;

// Pure function: ensure text ends with newline for consistent diffLines comparison
const ensureTrailingNewline = (text: string): string =>
  text.length > 0 && !text.endsWith('\n') ? `${text}\n` : text;

// Pure function: process lines and add word-level diffs
const processLinesWithWordDiff = async (
  oldText: string,
  newText: string
): Promise<LineDiffResult[]> => {
  const { diffLines, diffWords } = await getDiff();
  const computeWordDiffWith = computeWordDiff(diffWords);
  const diffResults = diffLines(ensureTrailingNewline(oldText), ensureTrailingNewline(newText));
  const lines: LineDiffResult[] = [];
  let oldLineNum = 1;
  // eslint-disable-next-line unicorn/consistent-compound-words -- this is the "new" line number paired with oldLineNum, not the compound word "newline"
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
      const wordDiffs = computeWordDiffWith({
        oldLine: current.content,
        newLine: next.content,
      });

      // Only apply word-level highlighting if lines are sufficiently similar
      if (computeSimilarity(wordDiffs) >= WORD_DIFF_SIMILARITY_THRESHOLD) {
        current.wordDiffs = filterWordDiffsByType('added', wordDiffs);
        next.wordDiffs = filterWordDiffsByType('removed', wordDiffs);
      }

      i++; // Skip next line as we processed the pair
    }
  }

  return lines;
};

// Pure function: format diff output.
// The annotation is what tells Remeda's curried steps their element type.
const formatDiffOutput: (lines: LineDiffResult[]) => string = piped(
  map((line: LineDiffResult) => {
    const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
    return `${prefix}${line.content}`;
  }),
  join('\n')
);

// Pure function: count changes
const countChanges = (lines: LineDiffResult[]): { insertions: number; deletions: number } =>
  pipe(
    lines,
    filter((line) => line.type !== 'equal'),
    reduce(
      (acc, line) => ({
        insertions: acc.insertions + (line.type === 'added' ? 1 : 0),
        deletions: acc.deletions + (line.type === 'removed' ? 1 : 0),
      }),
      { insertions: 0, deletions: 0 }
    )
  );

// Pure function: sanitize input text
const sanitizeInput = piped(
  (text: string | undefined) => text ?? '',
  (text) => text.trim()
);

const VIEW_OPTIONS = ['inline', 'side-by-side'] as const;
const NORMALIZE_FORMAT_OPTIONS = ['none', 'json', 'yaml'] as const;

export const textDiff: ToolPlugin = {
  id: 'diff',
  label: 'Text Diff',
  description: 'Compare two texts and highlight differences online',
  category: 'text',
  icon: <GitCompare className="h-4 w-4" />,
  keywords: [
    'diff',
    'compare',
    'difference',
    'merge',
    'text',
    'changes',
    'line',
    'word',
    'normalize',
    'json',
    'yaml',
  ],
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
    {
      id: 'normalizeFormat',
      label: 'Normalize format',
      type: 'select',
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'None (raw text)' },
        { value: 'json', label: 'JSON (sort keys + pretty-print)' },
        { value: 'yaml', label: 'YAML (reformat)' },
      ],
      helpText:
        'Reformat both sides before diffing so equivalent structures match. Falls back to raw text if parsing fails.',
    },
    {
      id: 'ignoreCase',
      label: 'Ignore case',
      type: 'checkbox',
      defaultValue: false,
      helpText: 'Lowercase both sides so casing differences are not shown.',
    },
    {
      id: 'trimWhitespace',
      label: 'Trim whitespace',
      type: 'checkbox',
      defaultValue: false,
      helpText: 'Trim each line and normalize line endings (CRLF -> LF) before comparing.',
    },
    {
      id: 'sortLines',
      label: 'Sort lines',
      type: 'checkbox',
      defaultValue: false,
      helpText: 'Sort lines alphabetically on each side before comparing (ignores reordering).',
    },
  ],
  isAsync: true,
  transformer: async (inputs) => {
    const oldText = sanitizeInput(inputs.oldText as string | undefined);
    const newText = sanitizeInput(inputs.newText as string | undefined);
    const diffView = getSelectInput(inputs, 'diffView', VIEW_OPTIONS, 'side-by-side');

    if (!oldText && !newText) {
      return failure('Please enter text to compare');
    }

    const normalizeOpts: NormalizeDiffOptions = {
      format: getSelectInput(inputs, 'normalizeFormat', NORMALIZE_FORMAT_OPTIONS, 'none'),
      ignoreCase: getBooleanInput(inputs, 'ignoreCase'),
      trimWhitespace: getBooleanInput(inputs, 'trimWhitespace'),
      sortLines: getBooleanInput(inputs, 'sortLines'),
    };

    // Process lines and add word-level diffs
    const [normalizedOld, normalizedNew] = await Promise.all([
      normalizeForDiff(oldText, normalizeOpts),
      normalizeForDiff(newText, normalizeOpts),
    ]);
    const processedLines = await processLinesWithWordDiff(normalizedOld, normalizedNew);

    // Generate statistics
    const stats = countChanges(processedLines);

    // Format output for copy functionality
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
