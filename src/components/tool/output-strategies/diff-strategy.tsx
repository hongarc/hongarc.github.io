import { DiffView } from '@/components/ui/diff-view';

import type { OutputStrategyProps } from './types';

export function DiffStrategy({ result }: OutputStrategyProps) {
  const diffData = result.meta?._diffData as
    | {
        lines: {
          type: 'equal' | 'insert' | 'delete';
          content: string;
          oldLineNum?: number;
          newLineNum?: number;
        }[];
        stats: { insertions: number; deletions: number };
        viewMode?: 'inline' | 'side-by-side';
      }
    | undefined;

  if (!diffData) return null;

  return (
    <div className="relative">
      <DiffView lines={diffData.lines} stats={diffData.stats} viewMode={diffData.viewMode} />
    </div>
  );
}
