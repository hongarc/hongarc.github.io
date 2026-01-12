import type { OutputStrategyProps } from './types';

export function DefaultStrategy({ result }: OutputStrategyProps) {
  return (
    <div className="relative">
      <pre className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-[13px] leading-relaxed text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100">
        {result.output}
      </pre>
    </div>
  );
}
