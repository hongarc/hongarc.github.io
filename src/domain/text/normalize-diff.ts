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
// The YAML parser is ~260 kB of source and only the 'yaml' format needs it, so
// it is imported on demand — which makes this async.
const canonicalizeYaml = async (text: string): Promise<string> => {
  if (text.trim() === '') return text;
  try {
    const { parse: parseYaml, stringify: stringifyYaml } = await import('yaml');
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

export const normalizeForDiff = async (
  text: string,
  opts: NormalizeDiffOptions
): Promise<string> => {
  let out = text;
  // Structural format first...
  if (opts.format === 'json') out = canonicalizeJson(out);
  else if (opts.format === 'yaml') out = await canonicalizeYaml(out);
  // ...then line-level ops in fixed order.
  if (opts.trimWhitespace) out = trimLines(out);
  if (opts.ignoreCase) out = out.toLowerCase();
  if (opts.sortLines) out = sortTextLines(out);
  return out;
};
