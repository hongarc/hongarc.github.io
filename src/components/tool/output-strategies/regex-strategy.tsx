import { RegexHighlight } from '@/components/ui/regex-highlight';

import type { OutputStrategyProps } from './types';

export function RegexStrategy({ result }: OutputStrategyProps) {
  const regexData = result.meta?._regexData as
    | { text: string; matches: { match: string; index: number; groups: string[] }[] }
    | undefined;

  if (!regexData) return null;

  return (
    <div className="relative">
      <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <RegexHighlight text={regexData.text} matches={regexData.matches} />
      </div>
    </div>
  );
}
