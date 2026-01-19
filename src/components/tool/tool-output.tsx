import { AlertCircle, Check, Copy, FileOutput, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { useTracking } from '@/hooks/use-tracking';
import type { TransformResult } from '@/types/plugin';

import { DefaultStrategy } from './output-strategies/default-strategy';
import { STRATEGIES } from './output-strategies/registry';

interface ToolOutputProps {
  result: TransformResult | null;
  isProcessing: boolean;
}

export function ToolOutput({ result, isProcessing }: ToolOutputProps) {
  const [copied, setCopied] = useState(false);
  const { trackCopy } = useTracking();

  const handleCopy = async () => {
    if (!result?.success || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      trackCopy();
    } catch {
      // Clipboard API failed
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Content skeleton */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200/50 bg-white/60 p-8 text-center backdrop-blur-sm transition-all dark:border-slate-700/50 dark:bg-slate-800/20">
        <div className="rounded-full bg-slate-100 p-3 ring-1 ring-slate-200/50 dark:bg-slate-800 dark:ring-slate-700/50">
          <FileOutput className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          Output will appear here
        </p>
      </div>
    );
  }

  if (!result.success && result.instruction) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200/50 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/20">
        <Sparkles className="mb-2 h-8 w-8 text-blue-300/80 dark:text-blue-600/50" />
        <p className="max-w-[280px] text-center font-sans text-sm font-medium text-blue-600/80 dark:text-blue-400/60">
          {result.instruction}
        </p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div
        className="rounded-xl border border-red-200/50 bg-red-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/20"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h4>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Find appropriate strategy
  const strategy = STRATEGIES.find((s) => s.shouldHandle(result));
  const StrategyComponent = strategy?.component ?? DefaultStrategy;

  // Filter out internal meta keys for display
  const displayMeta = result.meta
    ? Object.fromEntries(Object.entries(result.meta).filter(([key]) => !key.startsWith('_')))
    : {};

  return (
    <div className="space-y-3">
      {/* Show header/copy button unless it's a special view that handles its own header (like sections)  */}
      {strategy?.id !== 'sections' && strategy?.id !== 'qr' && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</span>
          <button
            onClick={handleCopy}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Render Strategy */}
      <div className="relative">
        <StrategyComponent result={result} meta={displayMeta} />
      </div>

      {/* Render Meta Tags (if not handled by strategy) */}
      {strategy?.id !== 'qr' && Object.keys(displayMeta).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(displayMeta).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              <span className="text-slate-400 dark:text-slate-500">{key}:</span>
              <span className="ml-1">{String(value)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
