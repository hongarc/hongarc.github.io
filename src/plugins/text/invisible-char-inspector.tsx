import { ScanSearch } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { CopyButton } from '@/components/ui/copy-button';
import {
  analyzeText,
  buildSegments,
  INVISIBLE_CHARS,
  removeInvisibleChars,
} from '@/domain/text/invisible-char';
import type { ToolPlugin } from '@/types/plugin';
import { success } from '@/utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ctp-mantle border-ctp-surface1 rounded-lg border px-3 py-2 text-center">
      <div className="text-ctp-text text-lg font-semibold">{value.toLocaleString()}</div>
      <div className="text-ctp-subtext0 text-xs">{label}</div>
    </div>
  );
}

// Example text with invisible chars embedded
const EXAMPLE_TEXT = `hidden: \u2060user@example.com\nnormal: user@example.com\nzero\u200Bwidth\u200Bspace\u200Dhere`;

function InvisibleCharInspectorComponent() {
  const [text, setText] = useState('');
  const [refOpen, setRefOpen] = useState(false);
  const [showClearHint, setShowClearHint] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  const analysis = useMemo(() => analyzeText(text), [text]);
  const segments = useMemo(() => buildSegments(text), [text]);

  const handleRemoveAll = useCallback(() => {
    setText((prev) => removeInvisibleChars(prev));
  }, []);

  const handleFillExample = useCallback(() => {
    if (text.length === 0) {
      setText(EXAMPLE_TEXT);
      setShowClearHint(false);
    } else {
      setShowClearHint(true);
    }
  }, [text.length]);

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="inspect-input" className="text-ctp-subtext1 text-sm font-medium">
              Text to Inspect <span className="text-ctp-red">*</span>
            </label>
            <button
              type="button"
              onClick={handleFillExample}
              className="text-ctp-blue hover:text-ctp-blue/80 cursor-pointer text-xs transition-colors"
            >
              Fill Example
            </button>
            {showClearHint && (
              <span className="text-ctp-peach text-xs">Clear text first</span>
            )}
          </div>
          {text && <CopyButton text={text} />}
        </div>
        <textarea
          id="inspect-input"
          value={text}
          onChange={(e) => { setText(e.target.value); setShowClearHint(false); }}
          placeholder="Paste text here to detect invisible characters..."
          rows={6}
          className="bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* Character Map — normal text inline, invisible chars as highlighted badges */}
      {text.length > 0 && analysis.invisibleChars > 0 && (
        <div>
          <div className="text-ctp-subtext1 mb-1.5 text-sm font-medium">Character Map</div>
          <div className="bg-ctp-mantle border-ctp-surface1 max-h-60 overflow-auto rounded-lg border p-2">
            <span className="break-words whitespace-pre-wrap font-mono text-sm">
              {segments.map((seg, i) =>
                seg.type === 'text' ? (
                  <span key={i} className="text-ctp-text">{seg.value}</span>
                ) : (
                  <span
                    key={i}
                    title={seg.info.name}
                    className={`mx-0.5 inline-block rounded px-1 py-0.5 align-baseline font-mono text-[10px] font-semibold leading-none ring-1 transition-colors ${
                      hoveredPosition === seg.index
                        ? 'bg-ctp-red text-ctp-base ring-ctp-red scale-110'
                        : 'bg-ctp-red/20 text-ctp-red ring-ctp-red/40'
                    }`}
                  >
                    {seg.info.unicode}
                  </span>
                ),
              )}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      {text.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Visible" value={analysis.visibleChars} />
          <StatCard label="Invisible" value={analysis.invisibleChars} />
          <StatCard label="Total" value={analysis.totalChars} />
        </div>
      )}

      {/* Findings */}
      {analysis.grouped.length > 0 && (
        <div className="bg-ctp-mantle border-ctp-surface1 rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ctp-subtext1 text-xs font-medium">
              Found {String(analysis.invisibleChars)} invisible character
              {analysis.invisibleChars === 1 ? '' : 's'} ({String(analysis.grouped.length)} type
              {analysis.grouped.length === 1 ? '' : 's'})
            </span>
            <button
              type="button"
              onClick={handleRemoveAll}
              className="bg-ctp-red/10 text-ctp-red hover:bg-ctp-red/20 cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors"
            >
              Remove All
            </button>
          </div>
          <div className="max-h-60 space-y-2 overflow-auto">
            {analysis.grouped.map((g) => (
              <div key={g.info.codePoint} className="bg-ctp-base rounded px-2 py-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ctp-text font-medium">{g.info.name}</span>
                  <span className="text-ctp-subtext0">
                    {String(g.count)}&times;
                  </span>
                </div>
                <div className="text-ctp-subtext1 mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono">
                  <span>{g.info.unicode}</span>
                  <span>{g.info.html}</span>
                  <span>
                    at{' '}
                    {(g.positions.length <= 10
                      ? g.positions
                      : g.positions.slice(0, 10)
                    ).map((pos, pi) => (
                      <span key={pos}>
                        {pi > 0 && ', '}
                        <span
                          onMouseEnter={() => { setHoveredPosition(pos); }}
                          onMouseLeave={() => { setHoveredPosition(null); }}
                          className="hover:text-ctp-red cursor-pointer underline decoration-dotted"
                        >
                          {String(pos)}
                        </span>
                      </span>
                    ))}
                    {g.positions.length > 10 && '…'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No findings message */}
      {text.length > 0 && analysis.grouped.length === 0 && (
        <div className="bg-ctp-green/10 text-ctp-green rounded-lg p-3 text-center text-sm">
          No invisible characters detected
        </div>
      )}

      {/* Known characters reference */}
      <details open={refOpen} onToggle={(e) => { setRefOpen(e.currentTarget.open); }}>
        <summary className="text-ctp-subtext0 hover:text-ctp-subtext1 cursor-pointer text-xs transition-colors">
          Known invisible characters reference ({String(INVISIBLE_CHARS.length)})
        </summary>
        <div className="mt-2 max-h-60 overflow-auto rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-ctp-mantle text-ctp-subtext1 sticky top-0">
              <tr>
                <th className="px-2 py-1.5 font-medium">Name</th>
                <th className="px-2 py-1.5 font-medium">Unicode</th>
                <th className="px-2 py-1.5 font-medium">HTML</th>
              </tr>
            </thead>
            <tbody className="text-ctp-subtext0 divide-ctp-surface0 divide-y font-mono">
              {INVISIBLE_CHARS.map((c) => (
                <tr key={c.codePoint} className="hover:bg-ctp-surface0/50">
                  <td className="px-2 py-1 font-sans">{c.name}</td>
                  <td className="px-2 py-1">{c.unicode}</td>
                  <td className="px-2 py-1">{c.html}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plugin export
// ---------------------------------------------------------------------------

export const invisibleCharInspector: ToolPlugin = {
  id: 'invisible-char-inspector',
  label: 'Invisible Char Inspector',
  description: 'Detect and remove zero-width and invisible Unicode characters',
  category: 'text',
  icon: <ScanSearch className="h-4 w-4" />,
  keywords: [
    'invisible',
    'zero-width',
    'hidden',
    'unicode',
    'zwsp',
    'bom',
    'whitespace',
    'non-breaking',
    'bidi',
  ],
  inputs: [],
  transformer: () => success(''),
  customComponent: InvisibleCharInspectorComponent,
};
