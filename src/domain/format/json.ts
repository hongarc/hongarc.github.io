import { identity, sortBy } from 'ramda';

/**
 * Type guard for plain objects
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Recursively sort object keys alphabetically
 */
export const sortObjectKeys = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item));
  }
  if (isPlainObject(obj)) {
    const sortedKeys = sortBy(identity, Object.keys(obj));
    const sorted: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
};

export type IndentType = '2' | '4' | 'tab' | '0';

/**
 * Get indentation value from option
 */
export const getIndentValue = (indent: IndentType): string | number => {
  if (indent === 'tab') return '\t';
  return Number(indent);
};

/**
 * Format JSON with optional key sorting
 */
export const formatJson = (input: string, indent: IndentType, sortKeys: boolean): string => {
  let parsed: unknown = JSON.parse(input);

  if (sortKeys) {
    parsed = sortObjectKeys(parsed);
  }

  const indentValue = getIndentValue(indent);
  return JSON.stringify(parsed, null, indentValue);
};
