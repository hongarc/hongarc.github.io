import { Highlight, themes } from 'prism-react-renderer';
import type { CSSProperties, Ref } from 'react';

export interface PrismHighlightProps {
  code: string;
  language: string;
  isDarkMode: boolean;
  className?: string;
  style?: CSSProperties;
  preRef?: Ref<HTMLPreElement>;
}

/**
 * The prism-react-renderer half of every code viewer, isolated in its own module.
 *
 * prism-react-renderer is ~130 kB of source and syntax colour is progressive
 * enhancement — the text is readable without it. Callers render this through
 * React.lazy with an unhighlighted <pre> as the Suspense fallback, so the
 * library stays out of the entry chunk and arrives a tick later.
 */
export default function PrismHighlight({
  code,
  language,
  isDarkMode,
  className,
  style,
  preRef,
}: PrismHighlightProps) {
  const theme = isDarkMode ? themes.nightOwl : themes.nightOwlLight;

  return (
    <Highlight theme={theme} code={code || ' '} language={language}>
      {({ style: themeStyle, tokens, getLineProps, getTokenProps }) => (
        <pre ref={preRef} className={className} style={{ ...themeStyle, ...style }}>
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
  );
}
