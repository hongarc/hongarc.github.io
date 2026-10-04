import {
  ArrowDownAZ,
  ArrowUpZA,
  Check,
  ChevronDown,
  Copy,
  Download,
  Filter,
  Minimize2,
  Sparkles,
  WrapText,
  X,
} from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  analyzeJson,
  formatJsonWithOrder,
  type IndentType,
  type SortOrder,
} from '@/domain/format/json';
import { useToolStore } from '@/store/tool-store';

const PrismHighlight = lazy(() => import('../ui/prism-highlight'));

// Shared by the editor overlay and its Suspense fallback — the textarea on top
// renders transparent text, so the fallback must still show the JSON.
const EDITOR_PRE_CLASSES =
  'border-ctp-surface1 absolute inset-0 overflow-auto rounded-lg border p-4 font-mono text-sm';
const PATH_RESULT_PRE_CLASSES =
  'border-ctp-mauve/30 bg-ctp-mantle max-h-48 overflow-auto rounded-lg border p-3 font-mono text-sm';

interface JsonEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

type IndentSize = 2 | 4 | 'tab';
type FormatMode = 'beautify' | 'minify' | 'none';

const formatDocument = (input: string, indent: IndentSize | 0, order: SortOrder): string =>
  formatJsonWithOrder(input, String(indent) as IndentType, order);

const formatBytes = (bytes: number): string =>
  bytes < 1024 ? `${bytes.toLocaleString()} B` : `${(bytes / 1024).toFixed(1)} KB`;

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

interface JsonPathOutcome {
  result: string | null;
  error: string | null;
}

const EMPTY_PATH_OUTCOME: JsonPathOutcome = { result: null, error: null };

// Execute JSONPath query. jsonpath-plus is only needed once the user actually
// types a path, so it is imported on demand instead of shipped in the entry chunk.
async function executeJsonPath(input: string, path: string): Promise<JsonPathOutcome> {
  if (!path.trim() || !input.trim()) {
    return EMPTY_PATH_OUTCOME;
  }

  try {
    const { JSONPath } = await import('jsonpath-plus');
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
  const { issue, stats } = useMemo(() => analyzeJson(input), [input]);
  const error = issue?.message ?? null;
  const [pathOutcome, setPathOutcome] = useState<JsonPathOutcome>(EMPTY_PATH_OUTCOME);
  const { result: pathResult, error: pathError } = pathOutcome;

  // JSONPath evaluation is async because the library loads on first use
  useEffect(() => {
    let cancelled = false;
    void executeJsonPath(input, jsonPath).then((outcome) => {
      if (!cancelled) setPathOutcome(outcome);
    });
    return () => {
      cancelled = true;
    };
  }, [input, jsonPath]);

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

  const handleBeautify = useCallback(() => {
    if (!input.trim() || error) return;
    handleInputChange(formatDocument(input, indent, sortOrder));
    setLastFormatMode('beautify');
  }, [input, error, indent, sortOrder, handleInputChange]);

  const handleMinify = useCallback(() => {
    if (!input.trim() || error) return;
    handleInputChange(formatDocument(input, 0, sortOrder));
    setLastFormatMode('minify');
  }, [input, error, sortOrder, handleInputChange]);

  const handleGoToError = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !issue || issue.position === null) return;
    textarea.focus();
    textarea.setSelectionRange(issue.position, Math.min(issue.position + 1, input.length));
  }, [issue, input.length]);

  const handleDownload = useCallback(() => {
    if (!input || error) return;
    const url = URL.createObjectURL(new Blob([input], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [input, error]);

  // Auto-beautify helper - called when settings change
  const autoBeautifyIfNeeded = useCallback(
    (newIndent: IndentSize, newSortOrder: SortOrder) => {
      if (lastFormatMode !== 'beautify' || !input.trim() || error) return;
      const formatted = formatDocument(input, newIndent, newSortOrder);
      if (formatted !== input) {
        setInput(formatted);
        onChange?.(formatted);
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

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={!input || !!error}
          className="text-ctp-text hover:bg-ctp-surface1 disabled:text-ctp-overlay0 flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
          title="Download as data.json"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
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
        <Suspense
          fallback={
            <pre
              ref={highlightRef}
              className={`${EDITOR_PRE_CLASSES} bg-ctp-mantle text-ctp-text ${
                wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre'
              }`}
              style={{ margin: 0 }}
            >
              {displayContent}
            </pre>
          }
        >
          <PrismHighlight
            code={displayContent}
            language="json"
            isDarkMode={isDarkMode}
            className={`${EDITOR_PRE_CLASSES} ${
              wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre'
            }`}
            style={{ margin: 0 }}
            preRef={highlightRef}
          />
        </Suspense>

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
      {issue && (
        <div className="bg-ctp-red/10 border-ctp-red/30 text-ctp-red flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          {issue.position !== null && (
            <button
              type="button"
              onClick={handleGoToError}
              className="bg-ctp-red/20 hover:bg-ctp-red/30 cursor-pointer rounded px-2 py-0.5 text-xs font-medium"
              title="Select the offending character"
            >
              Line {issue.line}, column {issue.column}
            </button>
          )}
          <span>{issue.message}</span>
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
          <Suspense
            fallback={
              <pre className={`${PATH_RESULT_PRE_CLASSES} text-ctp-text`} style={{ margin: 0 }}>
                {pathResult}
              </pre>
            }
          >
            <PrismHighlight
              code={pathResult}
              language="json"
              isDarkMode={isDarkMode}
              className={PATH_RESULT_PRE_CLASSES}
              style={{ margin: 0 }}
            />
          </Suspense>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="text-ctp-overlay1 flex flex-wrap gap-3 text-xs">
          <span>{stats.type}</span>
          <span>{formatBytes(stats.bytes)}</span>
          <span>{stats.lines.toLocaleString()} lines</span>
          {stats.type === 'array' && <span>{stats.size.toLocaleString()} items</span>}
          {stats.type === 'object' && <span>{stats.size.toLocaleString()} keys</span>}
          {stats.depth > 0 && <span>depth {stats.depth.toLocaleString()}</span>}
        </div>
      )}
    </div>
  );
}
