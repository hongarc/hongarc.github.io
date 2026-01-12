import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DiffPart {
  type: 'equal' | 'insert' | 'delete';
  value: string;
}

interface DiffLine {
  type: 'equal' | 'insert' | 'delete';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
  parts?: DiffPart[];
}

function DiffContent({
  content,
  parts,
  type,
}: {
  content: string;
  parts?: DiffPart[];
  type: 'insert' | 'delete' | 'equal';
}) {
  if (!parts || parts.length === 0) return <>{content}</>;

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'equal') {
          return <span key={i}>{part.value}</span>;
        }

        const isHighlight =
          (type === 'delete' && part.type === 'delete') ||
          (type === 'insert' && part.type === 'insert');

        if (!isHighlight) return null;

        return (
          <span
            key={i}
            className={`font-bold ${
              part.type === 'delete'
                ? 'bg-red-200/50 text-red-900 dark:bg-red-500/30 dark:text-red-100'
                : 'bg-green-200/50 text-green-900 dark:bg-green-500/30 dark:text-green-100'
            }`}
          >
            {part.value}
          </span>
        );
      })}
    </>
  );
}

interface DiffViewProps {
  lines: DiffLine[];
  stats: {
    insertions: number;
    deletions: number;
  };
  viewMode?: 'inline' | 'side-by-side';
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard API failed
    }
  }, [content]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-slate-400 opacity-0 transition-all group-hover/row:opacity-100 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      aria-label="Copy line"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function InlineView({ lines }: { lines: DiffLine[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle copy event to preserve newlines
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Get selected rows by checking which data-line-idx elements are in selection
      const range = selection.getRangeAt(0);
      const selectedLines: string[] = [];

      const rows = container.querySelectorAll('tr[data-line-idx]');
      for (const row of rows) {
        if (range.intersectsNode(row) && row instanceof HTMLElement) {
          const idx = Number.parseInt(row.dataset.lineIdx ?? '-1', 10);
          if (idx >= 0 && lines[idx]) {
            selectedLines.push(lines[idx].content);
          }
        }
      }

      if (selectedLines.length > 0) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', selectedLines.join('\n'));
      }
    };

    container.addEventListener('copy', handleCopy);
    return () => {
      container.removeEventListener('copy', handleCopy);
    };
  }, [lines]);

  return (
    <div ref={containerRef}>
      <table className="w-full border-collapse font-mono text-[13px]">
        <tbody>
          {lines.map((line, i) => (
            <tr
              key={i}
              data-line-idx={i}
              className={`group/row ${
                line.type === 'insert'
                  ? 'bg-green-50 dark:bg-green-500/10'
                  : line.type === 'delete'
                    ? 'bg-red-50 dark:bg-red-500/10'
                    : ''
              }`}
            >
              {/* Old line number */}
              <td className="w-10 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500">
                {line.type === 'insert' ? '' : line.oldLineNum}
              </td>
              {/* New line number */}
              <td className="w-10 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500">
                {line.type === 'delete' ? '' : line.newLineNum}
              </td>
              {/* Sign */}
              <td
                className={`w-6 px-2 py-0.5 text-center font-bold select-none ${
                  line.type === 'insert'
                    ? 'text-green-600 dark:text-green-400'
                    : line.type === 'delete'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {line.type === 'insert' ? '+' : line.type === 'delete' ? '-' : ' '}
              </td>
              {/* Content */}
              <td
                className={`py-0.5 pr-2 break-all whitespace-pre-wrap ${
                  line.type === 'insert'
                    ? 'text-green-800 dark:text-green-200'
                    : line.type === 'delete'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <DiffContent content={line.content} parts={line.parts} type={line.type} />
              </td>
              {/* Copy button */}
              <td className="w-8 px-1 py-0.5 select-none">
                <CopyButton content={line.content} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SideBySideLine {
  left?: DiffLine;
  right?: DiffLine;
}

function buildSideBySideLines(lines: DiffLine[]): SideBySideLine[] {
  const result: SideBySideLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    switch (line.type) {
      case 'equal': {
        result.push({ left: line, right: line });
        i++;
        break;
      }
      case 'delete': {
        // Look ahead for matching insert
        const deleteLines: DiffLine[] = [];
        while (i < lines.length && lines[i]?.type === 'delete') {
          const dl = lines[i];
          if (dl) deleteLines.push(dl);
          i++;
        }

        const insertLines: DiffLine[] = [];
        while (i < lines.length && lines[i]?.type === 'insert') {
          const il = lines[i];
          if (il) insertLines.push(il);
          i++;
        }

        // Pair up deletes with inserts
        const maxLen = Math.max(deleteLines.length, insertLines.length);
        for (let j = 0; j < maxLen; j++) {
          result.push({
            left: deleteLines[j],
            right: insertLines[j],
          });
        }
        break;
      }
      case 'insert': {
        result.push({ right: line });
        i++;
        break;
      }
    }
  }

  return result;
}

function SideBySideView({ lines }: { lines: DiffLine[] }) {
  const sideBySideLines = buildSideBySideLines(lines);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Handle copy event to preserve newlines for left side
  useEffect(() => {
    const container = leftRef.current;
    if (!container) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedLines: string[] = [];

      const rows = container.querySelectorAll('tr[data-left-idx]');
      for (const row of rows) {
        if (range.intersectsNode(row) && row instanceof HTMLElement) {
          const idx = Number.parseInt(row.dataset.leftIdx ?? '-1', 10);
          const content = sideBySideLines[idx]?.left?.content;
          if (idx >= 0 && content !== undefined) {
            selectedLines.push(content);
          }
        }
      }

      if (selectedLines.length > 0) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', selectedLines.join('\n'));
      }
    };

    container.addEventListener('copy', handleCopy);
    return () => {
      container.removeEventListener('copy', handleCopy);
    };
  }, [sideBySideLines]);

  // Handle copy event to preserve newlines for right side
  useEffect(() => {
    const container = rightRef.current;
    if (!container) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedLines: string[] = [];

      const rows = container.querySelectorAll('tr[data-right-idx]');
      for (const row of rows) {
        if (range.intersectsNode(row) && row instanceof HTMLElement) {
          const idx = Number.parseInt(row.dataset.rightIdx ?? '-1', 10);
          const content = sideBySideLines[idx]?.right?.content;
          if (idx >= 0 && content !== undefined) {
            selectedLines.push(content);
          }
        }
      }

      if (selectedLines.length > 0) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', selectedLines.join('\n'));
      }
    };

    container.addEventListener('copy', handleCopy);
    return () => {
      container.removeEventListener('copy', handleCopy);
    };
  }, [sideBySideLines]);

  return (
    <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
      {/* Left side (Original) */}
      <div ref={leftRef} className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                Original
              </th>
            </tr>
          </thead>
          <tbody>
            {sideBySideLines.map((pair, i) => (
              <tr
                key={i}
                data-left-idx={i}
                className={`group/row ${
                  pair.left?.type === 'delete' ? 'bg-red-50 dark:bg-red-500/10' : ''
                }`}
              >
                <td className="flex items-center">
                  <span className="w-8 flex-shrink-0 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500">
                    {pair.left?.oldLineNum ?? ''}
                  </span>
                  <span
                    className={`min-h-[1.5rem] flex-1 px-2 py-0.5 break-all whitespace-pre-wrap ${
                      pair.left?.type === 'delete'
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <DiffContent
                      content={pair.left?.content ?? ''}
                      parts={pair.left?.parts}
                      type="delete"
                    />
                  </span>
                  {pair.left?.content && (
                    <span className="flex-shrink-0 px-1">
                      <CopyButton content={pair.left.content} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right side (New) */}
      <div ref={rightRef} className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <th className="px-3 py-1.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                New
              </th>
            </tr>
          </thead>
          <tbody>
            {sideBySideLines.map((pair, i) => (
              <tr
                key={i}
                data-right-idx={i}
                className={`group/row ${
                  pair.right?.type === 'insert' ? 'bg-green-50 dark:bg-green-500/10' : ''
                }`}
              >
                <td className="flex items-center">
                  <span className="w-8 flex-shrink-0 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500">
                    {pair.right?.newLineNum ?? ''}
                  </span>
                  <span
                    className={`min-h-[1.5rem] flex-1 px-2 py-0.5 break-all whitespace-pre-wrap ${
                      pair.right?.type === 'insert'
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <DiffContent
                      content={pair.right?.content ?? ''}
                      parts={pair.right?.parts}
                      type="insert"
                    />
                  </span>
                  {pair.right?.content && (
                    <span className="flex-shrink-0 px-1">
                      <CopyButton content={pair.right.content} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DiffView({ lines, stats, viewMode = 'inline' }: DiffViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Stats header */}
      <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Changes:</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
          <span>+{stats.insertions}</span>
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <span>-{stats.deletions}</span>
        </span>
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
          Select text to copy multiple lines
        </span>
      </div>

      {/* Diff content */}
      <div className="max-h-[400px] overflow-auto">
        {viewMode === 'side-by-side' ? (
          <SideBySideView lines={lines} />
        ) : (
          <InlineView lines={lines} />
        )}
      </div>
    </div>
  );
}
