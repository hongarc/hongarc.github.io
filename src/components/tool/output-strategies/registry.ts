import { DefaultStrategy } from './default-strategy';
import { DiffStrategy } from './diff-strategy';
import { JsonStrategy } from './json-strategy';
import { QRStrategy } from './qr-strategy';
import { RegexStrategy } from './regex-strategy';
import { SectionStrategy } from './section-strategy';
import type { OutputStrategy } from './types';

// Strategies ordered by specificity
export const STRATEGIES: OutputStrategy[] = [
  {
    id: 'qr',
    component: QRStrategy,
    shouldHandle: (result) => result.meta?._viewMode === 'qr' && !!result.meta._qrData,
  },
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
    id: 'regex',
    component: RegexStrategy,
    shouldHandle: (result) => result.meta?._viewMode === 'regex' && !!result.meta._regexData,
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
