import { JsonTree } from '@/components/ui/json-tree';

import type { OutputStrategyProps } from './types';

export function JsonStrategy({ result }: OutputStrategyProps) {
  const parsedJson = result.meta?._parsedJson;

  if (!parsedJson) return null;

  return (
    <div className="relative">
      <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <JsonTree data={parsedJson} name="json" defaultExpanded />
      </div>
    </div>
  );
}
