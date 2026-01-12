import { camelCase, constantCase, kebabCase, pascalCase, snakeCase } from 'change-case';
import { join, map, pipe, split } from 'ramda';

export type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'upper' | 'lower';

export const caseConverters: Record<CaseType, (s: string) => string> = {
  camel: camelCase,
  pascal: pascalCase,
  snake: snakeCase,
  kebab: kebabCase,
  constant: constantCase,
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
};

/**
 * Convert each line using the selected case converter
 */
export const convertLines = (caseType: CaseType) =>
  pipe(split('\n'), map(caseConverters[caseType]), join('\n'));
