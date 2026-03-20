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
  const tableRef = useRef<HTMLTableElement>(null);

  // Isolate selection: mousedown on left disables right selection, and vice versa
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest('[data-side]') as HTMLElement | null;
      table.classList.remove('selecting-left', 'selecting-right');
      if (cell?.dataset.side === 'left') {
        table.classList.add('selecting-left');
      } else if (cell?.dataset.side === 'right') {
        table.classList.add('selecting-right');
      }
    };

    table.addEventListener('mousedown', handleMouseDown);
    return () => {
      table.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Handle copy event to preserve newlines for the selected side
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = globalThis.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedLines: string[] = [];
      const side = table.classList.contains('selecting-left')
        ? 'left'
        : table.classList.contains('selecting-right')
          ? 'right'
          : null;

      const rows = table.querySelectorAll('tr[data-row-idx]');
      for (const row of rows) {
        if (range.intersectsNode(row) && row instanceof HTMLElement) {
          const idx = Number.parseInt(row.dataset.rowIdx ?? '-1', 10);
          const pair = sideBySideLines[idx];
          if (idx >= 0 && pair) {
            const content =
              side === 'left'
                ? pair.left?.content
                : side === 'right'
                  ? pair.right?.content
                  : (pair.right?.content ?? pair.left?.content);
            if (content !== undefined) {
              selectedLines.push(content);
            }
          }
        }
      }

      if (selectedLines.length > 0) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', selectedLines.join('\n'));
      }
    };

    table.addEventListener('copy', handleCopy);
    return () => {
      table.removeEventListener('copy', handleCopy);
    };
  }, [sideBySideLines]);

  return (
    <>
      <style>{`
        .selecting-left [data-side="right"],
        .selecting-right [data-side="left"] {
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
      <table ref={tableRef} className="w-full border-collapse font-mono text-[13px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <th
              colSpan={3}
              className="w-1/2 border-r border-slate-200 px-3 py-1.5 text-left text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400"
            >
              Original
            </th>
            <th
              colSpan={3}
              className="w-1/2 px-3 py-1.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              New
            </th>
          </tr>
        </thead>
        <tbody>
          {sideBySideLines.map((pair, i) => {
            const leftBg =
              pair.left?.type === 'delete' ? 'bg-red-50 dark:bg-red-500/10' : '';
            const rightBg =
              pair.right?.type === 'insert' ? 'bg-green-50 dark:bg-green-500/10' : '';

            return (
              <tr key={i} data-row-idx={i} className="group/row">
                {/* Left line number */}
                <td
                  className={`w-8 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500 ${leftBg}`}
                >
                  {pair.left?.oldLineNum ?? ''}
                </td>
                {/* Left content */}
                <td
                  data-side="left"
                  className={`w-[calc(50%-2rem-1rem)] break-all whitespace-pre-wrap px-2 py-0.5 ${leftBg} ${
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
                </td>
                {/* Left copy */}
                <td
                  className={`w-8 border-r border-slate-200 px-1 py-0.5 select-none dark:border-slate-700 ${leftBg}`}
                >
                  {pair.left?.content ? <CopyButton content={pair.left.content} /> : null}
                </td>
                {/* Right line number */}
                <td
                  className={`w-8 border-r border-slate-200 px-2 py-0.5 text-right text-xs text-slate-400 select-none dark:border-slate-700 dark:text-slate-500 ${rightBg}`}
                >
                  {pair.right?.newLineNum ?? ''}
                </td>
                {/* Right content */}
                <td
                  data-side="right"
                  className={`break-all whitespace-pre-wrap px-2 py-0.5 ${rightBg} ${
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
                </td>
                {/* Right copy */}
                <td className={`w-8 px-1 py-0.5 select-none ${rightBg}`}>
                  {pair.right?.content ? <CopyButton content={pair.right.content} /> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
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
