import { Highlight, themes } from 'prism-react-renderer';
import { useSyncExternalStore } from 'react';

import { useToolStore } from '@/store/tool-store';

/**
 * Supported languages for syntax highlighting
 * Maps to prism-react-renderer language support
 */
export type HighlightLanguage =
  | 'json'
  | 'typescript'
  | 'javascript'
  | 'sql'
  | 'css'
  | 'html'
  | 'xml'
  | 'yaml'
  | 'markdown'
  | 'bash'
  | 'plain';

/**
 * Strategy Pattern: Language highlight strategy interface
 * Each strategy handles specific language rendering
 */
interface HighlightStrategy {
  language: string;
  getDisplayLanguage(): string;
}

/**
 * Concrete Strategy: JSON highlighting
 */
class JsonHighlightStrategy implements HighlightStrategy {
  language = 'json';
  getDisplayLanguage(): string {
    return 'JSON';
  }
}

/**
 * Concrete Strategy: TypeScript highlighting
 */
class TypeScriptHighlightStrategy implements HighlightStrategy {
  language = 'typescript';
  getDisplayLanguage(): string {
    return 'TypeScript';
  }
}

/**
 * Concrete Strategy: JavaScript highlighting
 */
class JavaScriptHighlightStrategy implements HighlightStrategy {
  language = 'javascript';
  getDisplayLanguage(): string {
    return 'JavaScript';
  }
}

/**
 * Concrete Strategy: SQL highlighting
 */
class SqlHighlightStrategy implements HighlightStrategy {
  language = 'sql';
  getDisplayLanguage(): string {
    return 'SQL';
  }
}

/**
 * Concrete Strategy: CSS highlighting
 */
class CssHighlightStrategy implements HighlightStrategy {
  language = 'css';
  getDisplayLanguage(): string {
    return 'CSS';
  }
}

/**
 * Concrete Strategy: HTML highlighting
 */
class HtmlHighlightStrategy implements HighlightStrategy {
  language = 'markup';
  getDisplayLanguage(): string {
    return 'HTML';
  }
}

/**
 * Concrete Strategy: XML highlighting
 */
class XmlHighlightStrategy implements HighlightStrategy {
  language = 'markup';
  getDisplayLanguage(): string {
    return 'XML';
  }
}

/**
 * Concrete Strategy: YAML highlighting
 */
class YamlHighlightStrategy implements HighlightStrategy {
  language = 'yaml';
  getDisplayLanguage(): string {
    return 'YAML';
  }
}

/**
 * Concrete Strategy: Markdown highlighting
 */
class MarkdownHighlightStrategy implements HighlightStrategy {
  language = 'markdown';
  getDisplayLanguage(): string {
    return 'Markdown';
  }
}

/**
 * Concrete Strategy: Bash/Shell highlighting
 */
class BashHighlightStrategy implements HighlightStrategy {
  language = 'bash';
  getDisplayLanguage(): string {
    return 'Bash';
  }
}

/**
 * Concrete Strategy: Plain text (no highlighting)
 */
class PlainTextHighlightStrategy implements HighlightStrategy {
  language = 'plain';
  getDisplayLanguage(): string {
    return 'Text';
  }
}

/**
 * Factory Pattern: Creates the appropriate highlight strategy
 * Using plain object with functions instead of class with static methods
 */
const strategyFactories: Record<HighlightLanguage, () => HighlightStrategy> = {
  json: () => new JsonHighlightStrategy(),
  typescript: () => new TypeScriptHighlightStrategy(),
  javascript: () => new JavaScriptHighlightStrategy(),
  sql: () => new SqlHighlightStrategy(),
  css: () => new CssHighlightStrategy(),
  html: () => new HtmlHighlightStrategy(),
  xml: () => new XmlHighlightStrategy(),
  yaml: () => new YamlHighlightStrategy(),
  markdown: () => new MarkdownHighlightStrategy(),
  bash: () => new BashHighlightStrategy(),
  plain: () => new PlainTextHighlightStrategy(),
};

const HighlightStrategyFactory = {
  create(language: HighlightLanguage): HighlightStrategy {
    const factory = strategyFactories[language];
    return factory();
  },

  isSupported(language: string): language is HighlightLanguage {
    return language in strategyFactories;
  },
};

// Dark mode detection using useSyncExternalStore
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

/**
 * Hook to detect dark mode from theme setting and system preference
 */
export function useIsDarkMode(): boolean {
  const theme = useToolStore((s) => s.theme);
  const systemDarkMode = useSyncExternalStore(
    subscribeToMediaQuery,
    getSystemDarkMode,
    () => false
  );

  return theme === 'system' ? systemDarkMode : theme === 'dark';
}

/**
 * Props for CodeHighlight component
 */
export interface CodeHighlightProps {
  code: string;
  language?: HighlightLanguage;
  maxHeight?: string;
  wrap?: boolean;
  className?: string;
  showLanguageBadge?: boolean;
}

/**
 * CodeHighlight Component
 *
 * Reusable syntax highlighting component using prism-react-renderer.
 * Implements Strategy Pattern for language-specific rendering and
 * Factory Pattern for strategy creation.
 */
export function CodeHighlight({
  code,
  language = 'plain',
  maxHeight = '400px',
  wrap = false,
  className = '',
  showLanguageBadge = false,
}: CodeHighlightProps) {
  const isDarkMode = useIsDarkMode();
  const strategy = HighlightStrategyFactory.create(language);
  const prismTheme = isDarkMode ? themes.nightOwl : themes.nightOwlLight;

  // Plain text doesn't need Prism highlighting
  if (language === 'plain') {
    return (
      <div className={`relative ${className}`}>
        {showLanguageBadge && (
          <div className="bg-ctp-surface0 text-ctp-subtext1 absolute top-2 right-2 rounded px-2 py-0.5 text-xs">
            {strategy.getDisplayLanguage()}
          </div>
        )}
        <pre
          className={`bg-ctp-mantle border-ctp-surface1 text-ctp-text overflow-auto rounded-lg border p-4 font-mono text-[13px] leading-relaxed ${
            wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre'
          }`}
          style={{ maxHeight }}
        >
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showLanguageBadge && (
        <div className="bg-ctp-surface0 text-ctp-subtext1 absolute top-2 right-2 z-10 rounded px-2 py-0.5 text-xs">
          {strategy.getDisplayLanguage()}
        </div>
      )}
      <Highlight theme={prismTheme} code={code || ' '} language={strategy.language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`border-ctp-surface1 overflow-auto rounded-lg border p-4 font-mono text-[13px] leading-relaxed ${
              wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre'
            }`}
            style={{
              ...style,
              maxHeight,
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
    </div>
  );
}

/**
 * Export types and factory for external use
 */
export { HighlightStrategyFactory };
