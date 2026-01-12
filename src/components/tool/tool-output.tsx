import { AlertCircle, Check, Copy, Download, FileOutput, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';

import { DiffView } from '@/components/ui/diff-view';
import { JsonTree } from '@/components/ui/json-tree';
import { RegexHighlight } from '@/components/ui/regex-highlight';
import type { OutputStat } from '@/components/ui/sectioned-output';
import { SectionedOutput } from '@/components/ui/sectioned-output';
import type { TransformResult } from '@/types/plugin';

// QR Display component
function QRDisplay({
  dataUrl,
  content,
  meta,
}: {
  dataUrl: string;
  content: string;
  meta: Record<string, unknown>;
}) {
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }, [dataUrl]);

  // Check if it's a VietQR transfer (has bank info)
  const isTransfer = !!meta.Bank || !!meta.Account;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* VietQR Header Style */}
        {isTransfer && (
          <div className="bg-blue-600 px-6 py-3 text-center text-white">
            <h3 className="font-semibold">Scan to Pay</h3>
          </div>
        )}

        <div className="p-6 text-center">
          <img src={dataUrl} alt="QR Code" className="mx-auto h-64 w-64" />
        </div>

        {/* Amount (if present) */}
        {!!meta.Amount && meta.Amount !== 'Not specified' && (
          <div className="border-t border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {String(meta.Amount as string | number)}
            </p>
          </div>
        )}

        {/* Transfer Details */}
        {isTransfer && (
          <div className="space-y-2 border-t border-slate-200 p-4 text-sm dark:border-slate-700">
            {!!meta.Bank && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bank</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {meta.Bank as string}
                </span>
              </div>
            )}
            {!!meta.Account && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account No.</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                  {String(meta.Account as string | number)}
                </span>
              </div>
            )}
            {!!meta['Account Name'] && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Name</span>
                <span className="font-medium text-slate-900 uppercase dark:text-slate-100">
                  {meta['Account Name'] as string}
                </span>
              </div>
            )}
            {!!meta.Message && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Message</span>
                <span className="max-w-[180px] text-right font-medium break-words text-slate-900 dark:text-slate-100">
                  {meta.Message as string}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
      </div>

      {!isTransfer && (
        <p className="max-w-md text-center text-xs break-all text-slate-500 dark:text-slate-400">
          {content.length > 100 ? `${content.slice(0, 100)}...` : content}
        </p>
      )}
    </div>
  );
}

interface ToolOutputProps {
  result: TransformResult | null;
  isProcessing: boolean;
}

export function ToolOutput({ result, isProcessing }: ToolOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.success || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
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
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
        <FileOutput className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
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
        className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30"
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

  // Check for special view modes
  const viewMode = result.meta?._viewMode as string | undefined;
  const isTreeView = viewMode === 'tree' && result.meta?._parsedJson;
  const isRegexView = viewMode === 'regex' && result.meta?._regexData;
  const isDiffView = viewMode === 'diff' && result.meta?._diffData;
  const isSectionsView = viewMode === 'sections' && result.meta?._sections;
  const isQRView = viewMode === 'qr' && result.meta?._qrData;
  const parsedJson = result.meta?._parsedJson;
  const regexData = result.meta?._regexData as
    | { text: string; matches: { match: string; index: number; groups: string[] }[] }
    | undefined;
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
  const sectionsData = result.meta?._sections as
    | { stats: OutputStat[]; content: string; contentLabel?: string }
    | undefined;
  const qrData = result.meta?._qrData as { dataUrl: string; content: string } | undefined;

  // Filter out internal meta keys for display
  const displayMeta = result.meta
    ? Object.fromEntries(Object.entries(result.meta).filter(([key]) => !key.startsWith('_')))
    : {};

  // QR view has its own layout
  if (isQRView && qrData) {
    return (
      <div className="space-y-3">
        <QRDisplay dataUrl={qrData.dataUrl} content={qrData.content} meta={displayMeta} />
      </div>
    );
  }

  // Sections view has its own header/copy button
  if (isSectionsView && sectionsData) {
    return (
      <div className="space-y-3">
        <SectionedOutput
          stats={sectionsData.stats}
          content={sectionsData.content}
          contentLabel={sectionsData.contentLabel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
      <div className="relative">
        {isTreeView && parsedJson ? (
          <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <JsonTree data={parsedJson} name="json" defaultExpanded />
          </div>
        ) : isRegexView && regexData ? (
          <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <RegexHighlight text={regexData.text} matches={regexData.matches} />
          </div>
        ) : isDiffView && diffData ? (
          <DiffView lines={diffData.lines} stats={diffData.stats} viewMode={diffData.viewMode} />
        ) : (
          <pre className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-[13px] leading-relaxed text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100">
            {result.output}
          </pre>
        )}
      </div>
      {Object.keys(displayMeta).length > 0 && (
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
