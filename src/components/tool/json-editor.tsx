import { JSONPath } from 'jsonpath-plus';
import {
  ArrowDownAZ,
  ArrowUpZA,
  Check,
  ChevronDown,
  Copy,
  Filter,
  Minimize2,
  Sparkles,
  WrapText,
  X,
} from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { useToolStore } from '@/store/tool-store';

interface JsonEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

type IndentSize = 2 | 4 | 'tab';
type SortOrder = 'asc' | 'desc' | 'none';
type FormatMode = 'beautify' | 'minify' | 'none';

// Strategy Pattern for JSON transformations
interface TransformStrategy {
  transform(data: unknown): unknown;
}

class SortKeysStrategy implements TransformStrategy {
  constructor(private order: 'asc' | 'desc') {}

  transform(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transform(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const sorted: Record<string, unknown> = {};
      const objRecord = obj as Record<string, unknown>;
      const keys = Object.keys(objRecord);
      keys.sort((a, b) => (this.order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
      for (const key of keys) {
        sorted[key] = this.transform(objRecord[key]);
      }
      return sorted;
    }
    return obj;
  }
}

class IdentityStrategy implements TransformStrategy {
  transform(data: unknown): unknown {
    return data;
  }
}

// Formatter using Strategy Pattern
class JsonFormatter {
  constructor(
    private indent: IndentSize | 0,
    private sortStrategy: TransformStrategy = new IdentityStrategy()
  ) {}

  format(input: string): string {
    const parsed: unknown = JSON.parse(input);
    const transformed = this.sortStrategy.transform(parsed);
    const indentValue = this.indent === 'tab' ? '\t' : this.indent;
    return JSON.stringify(transformed, null, indentValue);
  }
}

// Use useSyncExternalStore for dark mode detection
function subscribeToMediaQuery(callback: () => void): () => void {
  const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

function getSystemDarkMode(): boolean {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDarkMode(): boolean {
  const theme = useToolStore((s) => s.theme);
  const systemDarkMode = useSyncExternalStore(
    subscribeToMediaQuery,
    getSystemDarkMode,
    () => false
  );

  return theme === 'system' ? systemDarkMode : theme === 'dark';
}

// Validate JSON and return error message if invalid
function validateJson(input: string): string | null {
  if (!input.trim()) return null;
  try {
    JSON.parse(input);
    return null;
  } catch (error_) {
    return error_ instanceof Error ? error_.message : 'Invalid JSON';
  }
}

// Execute JSONPath query
function executeJsonPath(
  input: string,
  path: string
): { result: string | null; error: string | null } {
  if (!path.trim() || !input.trim()) {
    return { result: null, error: null };
  }

  try {
    const parsed = JSON.parse(input) as object;
    // Convert dot notation to JSONPath if needed
    let jsonPathQuery = path.trim();
    if (!jsonPathQuery.startsWith('$')) {
      jsonPathQuery = `$.${jsonPathQuery}`;
    }

    const queryResult: unknown[] = JSONPath({ path: jsonPathQuery, json: parsed });

    if (queryResult.length === 0) {
      return { result: 'No matches found', error: null };
    }
    if (queryResult.length === 1) {
      return { result: JSON.stringify(queryResult[0], null, 2), error: null };
    }
    return { result: JSON.stringify(queryResult, null, 2), error: null };
  } catch {
    return { result: null, error: 'Invalid path or JSON' };
  }
}

export function JsonEditor({ initialValue = '', onChange }: JsonEditorProps) {
  const isDarkMode = useIsDarkMode();
  const [input, setInput] = useState(initialValue);
  const [jsonPath, setJsonPath] = useState('');
  const [wrap, setWrap] = useState(true);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState<IndentSize>(2);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [showIndentMenu, setShowIndentMenu] = useState(false);
  const [lastFormatMode, setLastFormatMode] = useState<FormatMode>('none');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  // Computed values
  const error = useMemo(() => validateJson(input), [input]);
  const { result: pathResult, error: pathError } = useMemo(
    () => executeJsonPath(input, jsonPath),
    [input, jsonPath]
  );

  // Sync scroll between textarea and highlight
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      onChange?.(value);
    },
    [onChange]
  );

  const getSortStrategy = useCallback((): TransformStrategy => {
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      return new SortKeysStrategy(sortOrder);
    }
    return new IdentityStrategy();
  }, [sortOrder]);

  const handleBeautify = useCallback(() => {
    if (!input.trim() || error) return;
    try {
      const formatter = new JsonFormatter(indent, getSortStrategy());
      handleInputChange(formatter.format(input));
      setLastFormatMode('beautify');
    } catch {
      // Error already handled by validation
    }
  }, [input, error, indent, getSortStrategy, handleInputChange]);

  const handleMinify = useCallback(() => {
    if (!input.trim() || error) return;
    try {
      const formatter = new JsonFormatter(0, getSortStrategy());
      handleInputChange(formatter.format(input));
      setLastFormatMode('minify');
    } catch {
      // Error already handled by validation
    }
  }, [input, error, getSortStrategy, handleInputChange]);

  // Auto-beautify helper - called when settings change
  const autoBeautifyIfNeeded = useCallback(
    (newIndent: IndentSize, newSortOrder: SortOrder) => {
      if (lastFormatMode !== 'beautify' || !input.trim() || error) return;
      try {
        const sortStrategy =
          newSortOrder === 'asc' || newSortOrder === 'desc'
            ? new SortKeysStrategy(newSortOrder)
            : new IdentityStrategy();
        const formatter = new JsonFormatter(newIndent, sortStrategy);
        const formatted = formatter.format(input);
        if (formatted !== input) {
          setInput(formatted);
          onChange?.(formatted);
        }
      } catch {
        // Ignore formatting errors
      }
    },
    [lastFormatMode, input, error, onChange]
  );

  const handleIndentChange = useCallback(
    (newIndent: IndentSize) => {
      setIndent(newIndent);
      setShowIndentMenu(false);
      // Auto-beautify with new indent
      autoBeautifyIfNeeded(newIndent, sortOrder);
    },
    [sortOrder, autoBeautifyIfNeeded]
  );

  const handleToggleSort = useCallback(() => {
    const newSortOrder: SortOrder =
      sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
    setSortOrder(newSortOrder);
    // Auto-beautify with new sort order
    autoBeautifyIfNeeded(indent, newSortOrder);
  }, [sortOrder, indent, autoBeautifyIfNeeded]);

  const handleCopy = useCallback(async () => {
    const textToCopy = pathResult ?? input;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard failed
    }
  }, [input, pathResult]);

  const handleClear = useCallback(() => {
    handleInputChange('');
    setJsonPath('');
  }, [handleInputChange]);

  // Display content - either path result or formatted input
  const displayContent = useMemo(() => {
    if (pathResult && jsonPath.trim()) {
      return pathResult;
    }
    return input;
  }, [input, pathResult, jsonPath]);

  // Theme for Prism
  const prismTheme = isDarkMode ? themes.nightOwl : themes.nightOwlLight;

  const indentLabel = indent === 'tab' ? 'Tab' : `${String(indent)}sp`;

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-ctp-surface0 flex flex-wrap items-center gap-2 rounded-lg p-2">
        {/* Beautify with dropdown */}
        <div className="relative">
          <div className="flex">
            <button
              type="button"
              onClick={handleBeautify}
              disabled={!input.trim() || !!error}
              className="text-ctp-text hover:bg-ctp-surface1 disabled:text-ctp-overlay0 flex cursor-pointer items-center gap-1.5 rounded-l-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
              title="Beautify JSON"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Beautify</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIndentMenu(!showIndentMenu);
              }}
              className="text-ctp-text hover:bg-ctp-surface1 border-ctp-surface1 flex cursor-pointer items-center gap-1 rounded-r-md border-l px-2 py-1.5 text-xs font-medium transition-colors"
              title="Indent settings"
            >
              <span className="text-ctp-subtext1">{indentLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          {/* Indent dropdown menu */}
          {showIndentMenu && (
            <div className="bg-ctp-base border-ctp-surface1 absolute top-full left-0 z-10 mt-1 rounded-lg border py-1 shadow-lg">
              {([2, 4, 'tab'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    handleIndentChange(opt);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                    indent === opt
                      ? 'bg-ctp-blue/20 text-ctp-blue'
                      : 'text-ctp-text hover:bg-ctp-surface0'
                  }`}
                >
                  {indent === opt && <Check className="h-3 w-3" />}
                  <span className={indent === opt ? '' : 'ml-5'}>
                    {opt === 'tab' ? 'Tab' : `${String(opt)} spaces`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minify */}
        <button
          type="button"
          onClick={handleMinify}
          disabled={!input.trim() || !!error}
          className="text-ctp-text hover:bg-ctp-surface1 disabled:text-ctp-overlay0 flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
          title="Minify JSON"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          <span>Minify</span>
        </button>

        <div className="bg-ctp-surface1 h-5 w-px" />

        {/* Sort Toggle */}
        <button
          type="button"
          onClick={handleToggleSort}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            sortOrder === 'asc' || sortOrder === 'desc'
              ? 'bg-ctp-teal/20 text-ctp-teal'
              : 'text-ctp-text hover:bg-ctp-surface1'
          }`}
          title={`Sort keys: ${sortOrder === 'none' ? 'off' : sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`}
        >
          {sortOrder === 'desc' ? (
            <ArrowUpZA className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownAZ className="h-3.5 w-3.5" />
          )}
          <span>Sort</span>
          {(sortOrder === 'asc' || sortOrder === 'desc') && (
            <span className="bg-ctp-teal/30 rounded px-1 text-[10px]">
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </span>
          )}
        </button>

        <div className="bg-ctp-surface1 h-5 w-px" />

        {/* Wrap Toggle */}
        <button
          type="button"
          onClick={() => {
            setWrap(!wrap);
          }}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            wrap ? 'bg-ctp-blue/20 text-ctp-blue' : 'text-ctp-text hover:bg-ctp-surface1'
          }`}
          title="Toggle word wrap"
        >
          <WrapText className="h-3.5 w-3.5" />
          <span>Wrap</span>
        </button>

        <div className="flex-1" />

        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!displayContent}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
            copied
              ? 'bg-ctp-green/20 text-ctp-green'
              : 'text-ctp-text hover:bg-ctp-surface1 disabled:text-ctp-overlay0'
          }`}
          title="Copy to clipboard"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          disabled={!input}
          className="text-ctp-red hover:bg-ctp-red/10 disabled:text-ctp-overlay0 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
          title="Clear all"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* JSONPath Query */}
      <div className="bg-ctp-surface0 flex items-center gap-2 rounded-lg px-3 py-2">
        <Filter className="text-ctp-mauve h-4 w-4 flex-shrink-0" />
        <input
          type="text"
          value={jsonPath}
          onChange={(e) => {
            setJsonPath(e.target.value);
          }}
          placeholder="JSONPath query (e.g., a[0].b or $.store.book[*].author)"
          className="text-ctp-text placeholder-ctp-overlay0 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        {jsonPath && (
          <button
            type="button"
            onClick={() => {
              setJsonPath('');
            }}
            className="text-ctp-overlay1 hover:text-ctp-text cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Editor Area */}
      <div className="relative min-h-[400px]">
        {/* Syntax highlighted display */}
        <Highlight theme={prismTheme} code={displayContent || ' '} language="json">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={highlightRef}
              className={`border-ctp-surface1 absolute inset-0 overflow-auto rounded-lg border p-4 font-mono text-sm ${
                wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre'
              }`}
              style={{
                ...style,
                margin: 0,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>

        {/* Actual textarea for editing - positioned on top */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          onScroll={handleScroll}
          placeholder='{"key": "value"}'
          className={`absolute inset-0 w-full rounded-lg border bg-transparent p-4 font-mono text-sm text-transparent caret-current outline-none ${
            wrap ? 'break-words whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
          } ${error ? 'border-ctp-red caret-[var(--ctp-red)]' : 'focus:border-ctp-blue border-transparent caret-[var(--ctp-text)]'}`}
          spellCheck={false}
          style={{ caretColor: 'var(--ctp-text)' }}
        />

        {/* Placeholder when empty */}
        {!input && (
          <div className="text-ctp-overlay0 pointer-events-none absolute top-4 left-4 font-mono text-sm">
            {`{"key": "value"}`}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-ctp-red/10 border-ctp-red/30 text-ctp-red rounded-lg border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Path Error */}
      {pathError && (
        <div className="bg-ctp-yellow/10 border-ctp-yellow/30 text-ctp-yellow rounded-lg border px-3 py-2 text-sm">
          {pathError}
        </div>
      )}

      {/* JSONPath Result Preview */}
      {pathResult && jsonPath.trim() && !pathError && (
        <div className="space-y-2">
          <div className="text-ctp-subtext1 flex items-center gap-2 text-xs font-medium">
            <span>Query Result</span>
            <span className="bg-ctp-mauve/20 text-ctp-mauve rounded-full px-2 py-0.5">
              {jsonPath}
            </span>
          </div>
          <Highlight theme={prismTheme} code={pathResult} language="json">
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className="border-ctp-mauve/30 bg-ctp-mantle max-h-48 overflow-auto rounded-lg border p-3 font-mono text-sm"
                style={{ ...style, margin: 0 }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      )}

      {/* Stats */}
      {input && !error && (
        <div className="text-ctp-overlay1 flex flex-wrap gap-3 text-xs">
          <span>{input.length.toLocaleString()} characters</span>
          <span>{input.split('\n').length.toLocaleString()} lines</span>
          {(() => {
            try {
              const parsed: unknown = JSON.parse(input);
              if (Array.isArray(parsed)) {
                return <span>{parsed.length.toLocaleString()} items</span>;
              }
              if (typeof parsed === 'object' && parsed !== null) {
                return <span>{Object.keys(parsed).length.toLocaleString()} keys</span>;
              }
            } catch {
              // ignore
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
}
