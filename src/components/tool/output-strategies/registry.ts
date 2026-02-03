import { DefaultStrategy } from './default-strategy';
import { DiffStrategy } from './diff-strategy';
import { JsonStrategy } from './json-strategy';
import { SectionStrategy } from './section-strategy';
import type { OutputStrategy } from './types';

// Strategies ordered by specificity
export const STRATEGIES: OutputStrategy[] = [
  {
    id: 'diff',
    component: DiffStrategy,
    shouldHandle: (result) => result.meta?._viewMode === 'diff' && !!result.meta._diffData,
  },
  {
    id: 'json',
    component: JsonStrategy,
    shouldHandle: (result) => result.meta?._viewMode === 'tree' && !!result.meta._parsedJson,
  },
  {
    id: 'sections',
    component: SectionStrategy,
    shouldHandle: (result) => result.meta?._viewMode === 'sections' && !!result.meta._sections,
  },
  {
    id: 'default',
    component: DefaultStrategy,
    shouldHandle: () => true, // Fallback
  },
];
