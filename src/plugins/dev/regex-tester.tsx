import { Regex } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { CopyButton } from '@/components/ui/copy-button';
import { HighlightedTextarea } from '@/components/ui/highlighted-textarea';
import { useRegex, type RegexFlags } from '@/hooks/use-regex';
import type { ToolPlugin } from '@/types/plugin';
import { success } from '@/utils';

// Flag configuration - declarative, easy to extend
const FLAG_CONFIG = [
  { key: 'caseInsensitive', label: 'i (ignore case)' },
  { key: 'multiline', label: 'm (multiline)' },
  { key: 'dotAll', label: 's (dot all)' },
] as const;

type FlagKey = (typeof FLAG_CONFIG)[number]['key'];

// Checkbox styles
const CHECKBOX_CLASS =
  'border-ctp-surface2 bg-ctp-surface0 text-ctp-blue focus:ring-ctp-blue/20 h-4 w-4 cursor-pointer rounded transition-colors focus:ring-2';

function RegexTesterComponent() {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [flags, setFlags] = useState<RegexFlags>({
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  });

  // Use the regex hook - all matching logic encapsulated
  const { matches, ranges, error, flagString } = useRegex(pattern, text, flags);

  const handleFlagChange = useCallback((key: FlagKey) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Memoize match count text
  const matchCountText = useMemo(() => {
    if (matches.length === 0) return 'No matches found';
    return `Found ${String(matches.length)} match${matches.length === 1 ? '' : 'es'}`;
  }, [matches.length]);

  return (
    <div className="space-y-4">
      {/* Pattern Input */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="pattern" className="text-ctp-subtext1 text-sm font-medium">
            Pattern <span className="text-ctp-red">*</span>
          </label>
          {pattern && <CopyButton text={pattern} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ctp-overlay1 font-mono text-sm">/</span>
          <input
            id="pattern"
            type="text"
            value={pattern}
            onChange={(e) => {
              setPattern(e.target.value);
            }}
            placeholder={String.raw`\d+|[a-z]+`}
            className={`bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 flex-1 rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none ${
              error ? 'border-ctp-red' : ''
            }`}
          />
          <span className="text-ctp-overlay1 font-mono text-sm">/{flagString}</span>
        </div>
        {error && <p className="text-ctp-red mt-1 text-xs">{error}</p>}
      </div>

      {/* Flags - rendered from config (tabIndex=-1 to skip in tab order) */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {FLAG_CONFIG.map(({ key, label }) => (
          <label key={key} className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              tabIndex={-1}
              checked={Boolean(flags[key])}
              onChange={() => {
                handleFlagChange(key);
              }}
              className={CHECKBOX_CLASS}
            />
            <span className="text-ctp-subtext1 text-sm">{label}</span>
          </label>
        ))}
      </div>

      {/* Test String with Inline Highlighting */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="text" className="text-ctp-subtext1 text-sm font-medium">
            Test String <span className="text-ctp-red">*</span>
          </label>
          {text && <CopyButton text={text} />}
        </div>
        <HighlightedTextarea
          id="text"
          value={text}
          onChange={setText}
          ranges={ranges}
          placeholder="Enter text to test against..."
          rows={6}
        />
      </div>

      {/* Match Results Summary */}
      {pattern && text && !error && (
        <div className="bg-ctp-mantle border-ctp-surface1 rounded-lg border p-3">
          <div className="text-ctp-subtext1 mb-2 text-xs font-medium">{matchCountText}</div>
          {matches.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-auto">
              {matches.map((m, i) => (
                <div
                  key={`${String(i)}-${String(m.index)}`}
                  className="bg-ctp-base rounded px-2 py-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-ctp-subtext0">
                      Match {String(i + 1)} at index {String(m.index)}
                    </span>
                    <CopyButton text={m.match} variant="ghost" />
                  </div>
                  <div className="text-ctp-text mt-1">&quot;{m.match}&quot;</div>
                  {m.groups.length > 0 && (
                    <div className="text-ctp-subtext1 border-ctp-surface1 mt-1 space-y-0.5 border-t border-dashed pt-1">
                      {m.groups.map((g, gi) => (
                        <div key={gi}>
                          Group {String(gi + 1)}: &quot;{g}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const regexTester: ToolPlugin = {
  id: 'regex',
  label: 'Regex Tester',
  description: 'Test and debug regular expressions online with match highlighting',
  category: 'dev',
  icon: <Regex className="h-4 w-4" />,
  keywords: ['regex', 'regexp', 'regular', 'expression', 'pattern', 'match', 'test'],
  inputs: [],
  transformer: () => success(''),
  customComponent: RegexTesterComponent,
};
