import { Check, CircleHelp, Copy } from 'lucide-react';
import { useState } from 'react';

import {
  CodeHighlight,
  HighlightStrategyFactory,
  type HighlightLanguage,
} from '@/components/ui/code-highlight';
import { useTracking } from '@/hooks/use-tracking';

export interface OutputStat {
  label: string;
  value: string;
  type?: 'text' | 'badge' | 'progress';
  progress?: number; // 0-100 for progress type
  variant?: 'default' | 'success' | 'warning' | 'error';
  tooltip?: string;
}

export interface SectionedOutputProps {
  stats: OutputStat[];
  content: string;
  contentLabel?: string;
  language?: string;
  perLineCopy?: boolean;
}

const getVariantClasses = (variant: OutputStat['variant'] = 'default'): string => {
  switch (variant) {
    case 'success': {
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
    }
    case 'warning': {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    }
    case 'error': {
      return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    }
    default: {
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  }
};

const getProgressColor = (progress: number): string => {
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-amber-500';
  if (progress < 75) return 'bg-blue-500';
  return 'bg-green-500';
};

function StatItem({ stat }: { stat: OutputStat }) {
  const { label, value, type = 'text', progress = 0, variant, tooltip } = stat;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {label}
        {tooltip && (
          <span className="group relative">
            <CircleHelp className="h-3.5 w-3.5 cursor-help text-slate-400 dark:text-slate-500" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
              {tooltip}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
            </span>
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        {type === 'progress' && (
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full transition-all ${getProgressColor(progress)}`}
              style={{ width: `${String(Math.min(100, Math.max(0, progress)))}%` }}
            />
          </div>
        )}
        {type === 'badge' ? (
          <span
            className={`rounded-md px-2 py-0.5 text-sm font-medium ${getVariantClasses(variant)}`}
          >
            {value}
          </span>
        ) : (
          <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

function CopyLineButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { trackCopy } = useTracking();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      trackCopy();
    } catch {
      // Clipboard API failed
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 rounded p-1 transition-all ${
        copied
          ? 'text-green-600 dark:text-green-400'
          : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300'
      }`}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function SectionedOutput({
  stats,
  content,
  contentLabel = 'Generated',
  language,
  perLineCopy = false,
}: SectionedOutputProps) {
  // Determine highlight language
  const highlightLanguage: HighlightLanguage =
    language && HighlightStrategyFactory.isSupported(language) ? language : 'plain';
  const [copied, setCopied] = useState(false);
  const { trackCopy } = useTracking();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      trackCopy();
    } catch {
      // Clipboard API failed
    }
  };

  const lines = perLineCopy ? content.split('\n').filter((line) => line.trim()) : [];

  return (
    <div className="space-y-4">
      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white px-4 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/50">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      {/* Content Section */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {contentLabel}
          </span>
          <button
            onClick={handleCopy}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
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
                Copy All
              </>
            )}
          </button>
        </div>
        {perLineCopy && lines.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto bg-slate-50 p-2 dark:bg-slate-900/50">
            <div className="space-y-1">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded bg-white px-3 py-2 dark:bg-slate-800"
                >
                  <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-800 dark:text-slate-200">
                    {line}
                  </code>
                  <CopyLineButton text={line} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CodeHighlight
            code={content}
            language={highlightLanguage}
            maxHeight="300px"
            showLanguageBadge={highlightLanguage !== 'plain'}
          />
        )}
      </div>
    </div>
  );
}
