import { format as formatSqlLib } from 'sql-formatter';

export type SqlLanguage =
  | 'sql'
  | 'mysql'
  | 'postgresql'
  | 'mariadb'
  | 'sqlite'
  | 'bigquery'
  | 'spark';
export type KeywordCase = 'preserve' | 'upper' | 'lower';

export interface SqlFormatOptions {
  language: SqlLanguage;
  keywordCase: KeywordCase;
  tabWidth: number;
  linesBetweenQueries: number;
}

/**
 * Format SQL query using sql-formatter library
 */
export const formatSql = (input: string, options: SqlFormatOptions): string => {
  return formatSqlLib(input, {
    language: options.language,
    keywordCase: options.keywordCase,
    tabWidth: options.tabWidth,
    linesBetweenQueries: options.linesBetweenQueries,
    indentStyle: 'standard',
  });
};

/**
 * Count SQL statements in formatted query
 */
export const countStatements = (formatted: string): number => {
  return (formatted.match(/;/g) ?? []).length;
};
