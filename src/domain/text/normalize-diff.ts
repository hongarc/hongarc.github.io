import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { sortObjectKeys } from '@/domain/format/json';

export interface NormalizeDiffOptions {
  format: 'none' | 'json' | 'yaml';
  trimWhitespace: boolean;
  ignoreCase: boolean;
  sortLines: boolean;
}

// json: parse -> sort keys -> pretty-print. Raw text on parse failure (mid-edit / non-JSON).
const canonicalizeJson = (text: string): string => {
  if (text.trim() === '') return text;
  try {
    return JSON.stringify(sortObjectKeys(JSON.parse(text)), null, 2);
  } catch {
    return text;
  }
};

// yaml: parse -> stringify (reformat only). Raw text on parse failure.
const canonicalizeYaml = (text: string): string => {
  if (text.trim() === '') return text;
  try {
    return stringifyYaml(parseYaml(text));
  } catch {
    return text;
  }
};

const trimLines = (text: string): string =>
  text
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

const sortTextLines = (text: string): string =>
  text
    .split('\n')
    // eslint-disable-next-line unicorn/no-array-sort -- toSorted has type inference issues
    .sort((a, b) => a.localeCompare(b))
    .join('\n');

export const normalizeForDiff = (text: string, opts: NormalizeDiffOptions): string => {
  let out = text;
  // Structural format first...
  if (opts.format === 'json') out = canonicalizeJson(out);
  else if (opts.format === 'yaml') out = canonicalizeYaml(out);
  // ...then line-level ops in fixed order.
  if (opts.trimWhitespace) out = trimLines(out);
  if (opts.ignoreCase) out = out.toLowerCase();
  if (opts.sortLines) out = sortTextLines(out);
  return out;
};
