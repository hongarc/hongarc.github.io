import { Link } from 'lucide-react';
import qs from 'qs';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

// Pure function: parse URL into components
const parseUrl = (urlString: string): Record<string, string> | null => {
  try {
    const url = new URL(urlString);
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || '(default)',
      pathname: url.pathname,
      search: url.search || '(none)',
      hash: url.hash || '(none)',
      origin: url.origin,
      username: url.username || '(none)',
      password: url.password ? '****' : '(none)',
    };
  } catch {
    return null;
  }
};

// Type for parsed query values
type ParsedValue = string | string[] | qs.ParsedQs | qs.ParsedQs[] | undefined;

// Pure function: format a value for display
const formatValue = (value: ParsedValue): string => {
  if (value === undefined) {
    return '(empty)';
  }

  if (typeof value === 'string') {
    return value || '(empty)';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    // Simple inline array format: [value1, value2, ...]
    const items = value.map((item) => {
      if (typeof item === 'string') return item;
      return formatValue(item);
    });
    return `[${items.join(', ')}]`;
  }

  // Object - inline format: {key1: value1, key2: value2}
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    const items = entries.map(([k, v]) => `${k}: ${formatValue(v as ParsedValue)}`);
    return `{${items.join(', ')}}`;
  }

  return String(value);
};

// Pure function: parse and format query parameters using qs
const parseAndFormatParams = (search: string): { formatted: string; count: number } => {
  if (!search || search === '(none)') {
    return { formatted: '(no query parameters)', count: 0 };
  }

  // Remove leading ? if present
  const queryString = search.startsWith('?') ? search.slice(1) : search;

  // Parse with qs to handle arrays and nested objects
  const parsed = qs.parse(queryString, {
    allowDots: true,
    parseArrays: true,
  });

  const entries = Object.entries(parsed);
  if (entries.length === 0) {
    return { formatted: '(no query parameters)', count: 0 };
  }

  const lines = entries.map(([key, value]) => {
    return `${key} = ${formatValue(value as ParsedValue)}`;
  });

  return { formatted: lines.join('\n'), count: entries.length };
};

export const urlParser: ToolPlugin = {
  id: 'url-parser',
  label: 'URL Parser',
  description: 'Parse URLs into components',
  category: 'dev',
  icon: <Link className="h-4 w-4" />,
  keywords: ['url', 'parse', 'query', 'params', 'link', 'http', 'https'],
  inputs: [
    {
      id: 'input',
      label: 'URL',
      type: 'text',
      placeholder: 'https://example.com/path?query=value#hash',
      required: true,
      sensitive: true,
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');

    if (!input) {
      return failure('Please enter a URL');
    }

    const components = parseUrl(input);
    if (!components) {
      return failure('Invalid URL format');
    }

    const { formatted, count } = parseAndFormatParams(components.search ?? '');

    return success(formatted, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'Protocol', value: components.protocol ?? '' },
          { label: 'Host', value: components.host ?? '' },
          { label: 'Pathname', value: components.pathname ?? '' },
          { label: 'Hash', value: components.hash ?? '' },
        ],
        content: formatted,
        contentLabel: `Query Parameters (${String(count)})`,
      },
    });
  },
};
