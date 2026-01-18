import {
  CodeHighlight,
  HighlightStrategyFactory,
  type HighlightLanguage,
} from '@/components/ui/code-highlight';

import type { OutputStrategyProps } from './types';

export function DefaultStrategy({ result }: OutputStrategyProps) {
  // Get language from meta, default to plain text
  const metaLanguage = result.meta?._language as string | undefined;
  const language: HighlightLanguage =
    metaLanguage && HighlightStrategyFactory.isSupported(metaLanguage) ? metaLanguage : 'plain';

  return (
    <CodeHighlight
      code={result.output ?? ''}
      language={language}
      maxHeight="400px"
      showLanguageBadge={language !== 'plain'}
    />
  );
}
