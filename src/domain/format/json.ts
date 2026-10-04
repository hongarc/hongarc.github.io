import { identity, sortBy } from 'remeda';

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
    const sortedKeys = sortBy(Object.keys(obj), identity());
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

export type SortOrder = 'asc' | 'desc' | 'none';

/**
 * Recursively sort object keys using locale-aware comparison, ascending or descending
 */
export const sortKeysByOrder = (data: unknown, order: 'asc' | 'desc'): unknown => {
  if (Array.isArray(data)) {
    return data.map((item) => sortKeysByOrder(item, order));
  }
  if (isPlainObject(data)) {
    const keys = Object.keys(data);
    keys.sort((a, b) => (order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
    const sorted: Record<string, unknown> = {};
    for (const key of keys) {
      sorted[key] = sortKeysByOrder(data[key], order);
    }
    return sorted;
  }
  return data;
};

/**
 * Format JSON, optionally sorting keys ascending or descending. Indent '0' minifies.
 */
export const formatJsonWithOrder = (
  input: string,
  indent: IndentType,
  order: SortOrder
): string => {
  const parsed: unknown = JSON.parse(input);
  const data = order === 'none' ? parsed : sortKeysByOrder(parsed, order);
  return JSON.stringify(data, null, getIndentValue(indent));
};

export interface JsonIssue {
  message: string;
  /** Zero-based character offset of the error, or null when the engine did not report one */
  position: number | null;
  /** One-based line of the error, or null when unknown */
  line: number | null;
  /** One-based column of the error, or null when unknown */
  column: number | null;
}

export type JsonValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface JsonStats {
  type: JsonValueType;
  /** Number of keys (object) or items (array); 0 for scalars */
  size: number;
  /** Nesting depth of containers; 0 for scalars */
  depth: number;
  bytes: number;
  lines: number;
}

export interface JsonAnalysis {
  issue: JsonIssue | null;
  stats: JsonStats | null;
}

const lineColumnOf = (input: string, position: number): { line: number; column: number } => {
  const lines = input.slice(0, position).split('\n');
  return { line: lines.length, column: (lines.at(-1) ?? '').length + 1 };
};

class JsonSyntaxError extends Error {
  constructor(readonly position: number) {
    super('Invalid JSON');
  }
}

const JSON_WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const JSON_NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const JSON_HEX4 = /^[\dA-Fa-f]{4}$/;
const JSON_SIMPLE_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't']);

/**
 * Offset of the first character that makes the text invalid JSON, or null when the
 * text is valid. Browsers disagree on whether JSON.parse errors carry a position
 * (recent V8 often omits it), so the location is found independently of the message.
 */
export const findJsonErrorPosition = (input: string): number | null => {
  let i = 0;

  const skipWhitespace = () => {
    while (i < input.length && JSON_WHITESPACE.has(input.charAt(i))) i++;
  };

  const consume = (char: string) => {
    if (input.charAt(i) !== char) throw new JsonSyntaxError(i);
    i++;
  };

  const parseString = () => {
    consume('"');
    for (;;) {
      if (i >= input.length) throw new JsonSyntaxError(input.length);
      const char = input.charAt(i);
      if (char === '"') {
        i++;
        return;
      }
      if (char < ' ') throw new JsonSyntaxError(i);
      if (char !== '\\') {
        i++;
        continue;
      }
      const escape = input.charAt(i + 1);
      if (JSON_SIMPLE_ESCAPES.has(escape)) {
        i += 2;
      } else if (escape === 'u' && JSON_HEX4.test(input.slice(i + 2, i + 6))) {
        i += 6;
      } else {
        throw new JsonSyntaxError(Math.min(i + 1, input.length));
      }
    }
  };

  const parseContainer = (close: string, parseMember: () => void) => {
    i++;
    skipWhitespace();
    if (input.charAt(i) === close) {
      i++;
      return;
    }
    for (;;) {
      skipWhitespace();
      parseMember();
      skipWhitespace();
      if (input.charAt(i) === ',') {
        i++;
        continue;
      }
      consume(close);
      return;
    }
  };

  const parseValue = (): void => {
    skipWhitespace();
    switch (input.charAt(i)) {
      case '{': {
        parseContainer('}', () => {
          parseString();
          skipWhitespace();
          consume(':');
          parseValue();
        });
        return;
      }
      case '[': {
        parseContainer(']', parseValue);
        return;
      }
      case '"': {
        parseString();
        return;
      }
      default: {
        const literal = ['true', 'false', 'null'].find((word) => input.startsWith(word, i));
        if (literal) {
          i += literal.length;
          return;
        }
        JSON_NUMBER.lastIndex = i;
        if (!JSON_NUMBER.test(input)) throw new JsonSyntaxError(i);
        i = JSON_NUMBER.lastIndex;
      }
    }
  };

  try {
    parseValue();
    skipWhitespace();
    return i < input.length ? i : null;
  } catch (error) {
    if (error instanceof JsonSyntaxError) return error.position;
    return null;
  }
};

/**
 * Turn a JSON.parse error into a message with a character offset, line and column.
 */
export const describeJsonError = (input: string, error: unknown): JsonIssue => {
  const message = error instanceof Error ? error.message : 'Invalid JSON';
  const position = findJsonErrorPosition(input);
  if (position === null) return { message, position: null, line: null, column: null };
  return { message, position, ...lineColumnOf(input, position) };
};

const getValueType = (value: unknown): JsonValueType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  return 'boolean';
};

const measureDepth = (root: unknown): number => {
  let max = 0;
  const stack: [unknown, number][] = [[root, 1]];
  for (let entry = stack.pop(); entry; entry = stack.pop()) {
    const [value, depth] = entry;
    if (value !== null && typeof value === 'object') {
      max = Math.max(max, depth);
      for (const child of Object.values(value)) {
        stack.push([child, depth + 1]);
      }
    }
  }
  return max;
};

/**
 * Parse once and report either the error location or statistics about the document.
 * Blank input is neither valid nor an error.
 */
export const analyzeJson = (input: string): JsonAnalysis => {
  if (!input.trim()) return { issue: null, stats: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return { issue: describeJsonError(input, error), stats: null };
  }

  const type = getValueType(parsed);
  const size = type === 'object' || type === 'array' ? Object.keys(parsed as object).length : 0;
  return {
    issue: null,
    stats: {
      type,
      size,
      depth: measureDepth(parsed),
      bytes: new TextEncoder().encode(input).length,
      lines: input.split('\n').length,
    },
  };
};
