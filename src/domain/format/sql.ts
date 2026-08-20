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
 * Format SQL query using sql-formatter library.
 * The library is ~420 kB of source and only this tool needs it, so it is
 * imported on demand — which makes this function async.
 */
export const formatSql = async (input: string, options: SqlFormatOptions): Promise<string> => {
  const { format: formatSqlLib } = await import('sql-formatter');
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
