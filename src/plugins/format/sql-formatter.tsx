import { Database } from 'lucide-react';
import { format as formatSql } from 'sql-formatter';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const LANGUAGE_OPTIONS = [
  'sql',
  'mysql',
  'postgresql',
  'mariadb',
  'sqlite',
  'bigquery',
  'spark',
] as const;
const CASE_OPTIONS = ['preserve', 'upper', 'lower'] as const;
const INDENT_OPTIONS = ['2', '4'] as const;

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`;

export const sqlFormatter: ToolPlugin = {
  id: 'sql-formatter',
  label: 'SQL Formatter',
  description: 'Format and beautify SQL queries',
  category: 'format',
  icon: <Database className="h-4 w-4" />,
  keywords: ['sql', 'format', 'beautify', 'query', 'mysql', 'postgresql', 'database'],
  inputs: [
    {
      id: 'input',
      label: 'SQL Query',
      type: 'textarea',
      placeholder: 'Paste your SQL query here...',
      required: true,
      rows: 10,
      sensitive: true,
    },
    {
      id: 'language',
      label: 'Dialect',
      type: 'select',
      defaultValue: 'sql',
      options: [
        { value: 'sql', label: 'Standard SQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'mariadb', label: 'MariaDB' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'bigquery', label: 'BigQuery' },
        { value: 'spark', label: 'Spark SQL' },
      ],
      group: 'settings',
    },
    {
      id: 'keywordCase',
      label: 'Keywords',
      type: 'select',
      defaultValue: 'upper',
      options: [
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'lower', label: 'lowercase' },
        { value: 'preserve', label: 'Preserve' },
      ],
      group: 'settings',
    },
    {
      id: 'indent',
      label: 'Indent',
      type: 'select',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
    {
      id: 'linesBetweenQueries',
      label: 'Lines Between Queries',
      type: 'select',
      defaultValue: '2',
      options: [
        { value: '1', label: '1 line' },
        { value: '2', label: '2 lines' },
        { value: '3', label: '3 lines' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const language = getSelectInput(inputs, 'language', LANGUAGE_OPTIONS, 'sql');
    const keywordCase = getSelectInput(inputs, 'keywordCase', CASE_OPTIONS, 'upper');
    const indent = getSelectInput(inputs, 'indent', INDENT_OPTIONS, '2');
    const linesBetweenQueries = Number(inputs.linesBetweenQueries) || 2;

    if (!input) {
      return failure(`Please enter a SQL query. Example:\n\n${SAMPLE_SQL}`);
    }

    try {
      const formatted = formatSql(input, {
        language,
        keywordCase,
        tabWidth: Number(indent),
        linesBetweenQueries,
        indentStyle: 'standard',
      });

      // Count statements
      const statementCount = (formatted.match(/;/g) ?? []).length;

      return success(formatted, {
        dialect: language.toUpperCase(),
        statements: statementCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Formatting failed';
      return failure(`SQL Error: ${message}`);
    }
  },
};
