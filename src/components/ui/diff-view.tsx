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
                ? 'bg-ctp-red/20 text-ctp-red'
                : 'bg-ctp-green/20 text-ctp-green'
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
      className="text-ctp-overlay0 hover:bg-ctp-surface1 hover:text-ctp-text flex h-5 w-5 cursor-pointer items-center justify-center rounded opacity-0 transition-all group-hover/row:opacity-100"
      aria-label="Copy line"
    >
      {copied ? <Check className="text-ctp-green h-3 w-3" /> : <Copy className="h-3 w-3" />}
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
                  ? 'bg-ctp-green/10'
                  : line.type === 'delete'
                    ? 'bg-ctp-red/10'
                    : ''
              }`}
            >
              {/* Old line number */}
              <td className="border-ctp-surface0 text-ctp-overlay0 w-10 border-r px-2 py-0.5 text-right text-xs select-none">
                {line.type === 'insert' ? '' : line.oldLineNum}
              </td>
              {/* New line number */}
              <td className="border-ctp-surface0 text-ctp-overlay0 w-10 border-r px-2 py-0.5 text-right text-xs select-none">
                {line.type === 'delete' ? '' : line.newLineNum}
              </td>
              {/* Sign */}
              <td
                className={`w-6 px-2 py-0.5 text-center font-bold select-none ${
                  line.type === 'insert'
                    ? 'text-ctp-green'
                    : line.type === 'delete'
                      ? 'text-ctp-red'
                      : 'text-ctp-overlay0'
                }`}
              >
                {line.type === 'insert' ? '+' : line.type === 'delete' ? '-' : ' '}
              </td>
              {/* Content */}
              <td
                className={`py-0.5 pr-2 break-all whitespace-pre-wrap ${
                  line.type === 'insert'
                    ? 'text-ctp-green'
                    : line.type === 'delete'
                      ? 'text-ctp-red'
                      : 'text-ctp-text'
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
      const cell = target.closest('[data-side]');
      table.classList.remove('selecting-left', 'selecting-right');
      if (cell instanceof HTMLElement && cell.dataset.side === 'left') {
        table.classList.add('selecting-left');
      } else if (cell instanceof HTMLElement && cell.dataset.side === 'right') {
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
    <table ref={tableRef} className="diff-table w-full border-collapse font-mono text-[13px]">
      <thead>
        <tr className="border-ctp-surface0 bg-ctp-surface0 border-b">
          <th
            colSpan={3}
            className="border-ctp-surface0 text-ctp-subtext0 w-1/2 border-r px-3 py-1.5 text-left text-xs font-semibold"
          >
            Original
          </th>
          <th
            colSpan={3}
            className="text-ctp-subtext0 w-1/2 px-3 py-1.5 text-left text-xs font-semibold"
          >
            New
          </th>
        </tr>
      </thead>
      <tbody>
        {sideBySideLines.map((pair, i) => {
          const leftBg = pair.left?.type === 'delete' ? 'bg-ctp-red/10' : '';
          const rightBg = pair.right?.type === 'insert' ? 'bg-ctp-green/10' : '';

          return (
            <tr key={i} data-row-idx={i} className="group/row">
              {/* Left line number */}
              <td
                className={`border-ctp-surface0 text-ctp-overlay0 w-8 border-r px-2 py-0.5 text-right text-xs select-none ${leftBg}`}
              >
                {pair.left?.oldLineNum ?? ''}
              </td>
              {/* Left content */}
              <td
                data-side="left"
                className={`w-[calc(50%-2rem-1rem)] px-2 py-0.5 break-all whitespace-pre-wrap ${leftBg} ${
                  pair.left?.type === 'delete' ? 'text-ctp-red' : 'text-ctp-text'
                }`}
              >
                <DiffContent
                  content={pair.left?.content ?? ''}
                  parts={pair.left?.parts}
                  type="delete"
                />
              </td>
              {/* Left copy */}
              <td className={`border-ctp-surface0 w-8 border-r px-1 py-0.5 select-none ${leftBg}`}>
                {pair.left?.content ? <CopyButton content={pair.left.content} /> : null}
              </td>
              {/* Right line number */}
              <td
                className={`border-ctp-surface0 text-ctp-overlay0 w-8 border-r px-2 py-0.5 text-right text-xs select-none ${rightBg}`}
              >
                {pair.right?.newLineNum ?? ''}
              </td>
              {/* Right content */}
              <td
                data-side="right"
                className={`px-2 py-0.5 break-all whitespace-pre-wrap ${rightBg} ${
                  pair.right?.type === 'insert' ? 'text-ctp-green' : 'text-ctp-text'
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
  );
}

export function DiffView({ lines, stats, viewMode = 'inline' }: DiffViewProps) {
  return (
    <div className="border-ctp-surface0 overflow-hidden rounded-lg border">
      {/* Stats header */}
      <div className="border-ctp-surface0 bg-ctp-mantle flex items-center gap-4 border-b px-4 py-2">
        <span className="text-ctp-subtext0 text-xs font-medium">Changes:</span>
        <span className="text-ctp-green flex items-center gap-1 text-xs font-semibold">
          <span>+{stats.insertions}</span>
        </span>
        <span className="text-ctp-red flex items-center gap-1 text-xs font-semibold">
          <span>-{stats.deletions}</span>
        </span>
        <span className="text-ctp-overlay0 ml-auto text-xs">
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
