import { pipe, toLower, trim } from 'ramda';

export type SeparatorType = 'dash' | 'underscore' | 'dot';

export const separators: Record<SeparatorType, string> = {
  dash: '-',
  underscore: '_',
  dot: '.',
};

// Pure function: remove accents/diacritics
export const removeAccents = (str: string): string =>
  str.normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '');

// Pure function: remove special characters
export const removeSpecialChars = (str: string): string => str.replaceAll(/[^\w\s-]/g, '');

// Pure function: collapse whitespace
export const collapseWhitespace = (str: string): string => str.replaceAll(/\s+/g, ' ');

// Pure function: replace spaces with separator
export const replaceSpaces =
  (separator: string) =>
  (str: string): string =>
    str.replaceAll(/\s/g, separator);

// Pure function: collapse repeated separators
export const collapseSeparators =
  (separator: string) =>
  (str: string): string => {
    const escaped = separator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    return str.replaceAll(new RegExp(`${escaped}+`, 'g'), separator);
  };

// Pure function: trim separators from ends
export const trimSeparators =
  (separator: string) =>
  (str: string): string => {
    const escaped = separator.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    return str.replaceAll(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '');
  };

// Compose slug transformation using Ramda pipe
export const createSlug = (separator: string) =>
  pipe(
    trim,
    toLower,
    removeAccents,
    removeSpecialChars,
    collapseWhitespace,
    replaceSpaces(separator),
    collapseSeparators(separator),
    trimSeparators(separator)
  );
