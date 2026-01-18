import { Highlight, themes } from 'prism-react-renderer';
import { useCallback, useRef } from 'react';

import { type HighlightLanguage, HighlightStrategyFactory, useIsDarkMode } from './code-highlight';

export interface CodeTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  language: HighlightLanguage;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

/**
 * CodeTextarea Component
 *
 * A textarea with syntax highlighting overlay.
 * Uses the same transparent textarea + highlighted pre technique as JsonEditor.
 */
export function CodeTextarea({
  id,
  value,
  onChange,
  language,
  placeholder,
  rows = 6,
  required,
  className = '',
}: CodeTextareaProps) {
  const isDarkMode = useIsDarkMode();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const strategy = HighlightStrategyFactory.create(language);
  const prismTheme = isDarkMode ? themes.nightOwl : themes.nightOwlLight;

  // Sync scroll between textarea and highlight
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Calculate height based on rows
  const minHeight = `${String(rows * 1.5 + 1.5)}rem`;

  return (
    <div className={`relative ${className}`} style={{ minHeight }}>
      {/* Syntax highlighted display */}
      <Highlight theme={prismTheme} code={value || ' '} language={strategy.language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            ref={highlightRef}
            className="border-ctp-surface1 pointer-events-none absolute inset-0 overflow-auto rounded-lg border p-3.5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap"
            style={{
              ...style,
              margin: 0,
              minHeight,
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
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onScroll={handleScroll}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="focus:border-ctp-blue absolute inset-0 w-full resize-y rounded-lg border border-transparent bg-transparent p-3.5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-transparent caret-current outline-none"
        style={{
          caretColor: 'var(--ctp-text)',
          minHeight,
        }}
        spellCheck={false}
      />

      {/* Placeholder when empty */}
      {!value && placeholder && (
        <div
          className="text-ctp-overlay0 pointer-events-none absolute top-3.5 left-3.5 font-mono text-[13px]"
          style={{ lineHeight: '1.5' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
