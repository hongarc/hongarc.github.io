import type { OutputStat } from '@/components/ui/sectioned-output';
import { SectionedOutput } from '@/components/ui/sectioned-output';

import type { OutputStrategyProps } from './types';

export function SectionStrategy({ result }: OutputStrategyProps) {
  const sectionsData = result.meta?._sections as
    | { stats: OutputStat[]; content: string; contentLabel?: string; language?: string }
    | undefined;

  if (!sectionsData) return null;

  return (
    <div className="space-y-3">
      <SectionedOutput
        stats={sectionsData.stats}
        content={sectionsData.content}
        contentLabel={sectionsData.contentLabel}
        language={sectionsData.language}
      />
    </div>
  );
}
