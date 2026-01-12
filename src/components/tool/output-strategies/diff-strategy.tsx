import { DiffView } from '@/components/ui/diff-view';

import type { OutputStrategyProps } from './types';

export function DiffStrategy({ result }: OutputStrategyProps) {
  const diffData = result.meta?._diffData as
    | {
        lines: {
          type: 'equal' | 'added' | 'removed';
          content: string;
          oldLineNum?: number;
          newLineNum?: number;
          wordDiffs?: {
            type: 'equal' | 'added' | 'removed';
            value: string;
          }[];
          formattedContent?: string;
        }[];
        stats: { insertions: number; deletions: number };
        viewMode?: 'inline' | 'side-by-side';
        hasWordHighlighting?: boolean;
      }
    | undefined;

  if (!diffData) return null;

  // Convert our diff format to the DiffView expected format
  const convertedLines = diffData.lines.map((line) => ({
    type:
      line.type === 'added'
        ? ('insert' as const)
        : line.type === 'removed'
          ? ('delete' as const)
          : ('equal' as const),
    content: line.content,
    oldLineNum: line.oldLineNum,
    newLineNum: line.newLineNum,
    parts: line.wordDiffs?.map((diff) => ({
      type:
        diff.type === 'added'
          ? ('insert' as const)
          : diff.type === 'removed'
            ? ('delete' as const)
            : ('equal' as const),
      value: diff.value,
    })),
  }));

  return (
    <div className="relative">
      <DiffView lines={convertedLines} stats={diffData.stats} viewMode={diffData.viewMode} />
    </div>
  );
}
