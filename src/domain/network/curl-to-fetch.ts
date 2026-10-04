export interface CurlRequest {
  url: string;
  method: string;
  headers: readonly [string, string][];
  body?: string;
}

export interface CurlError {
  error: string;
}

type Tokens = { tokens: readonly string[] } | CurlError;

const DOUBLE_QUOTE_ESCAPES = new Set(['"', '\\', '$', '`']);
const IGNORED_FLAGS = new Set(['--compressed', '-s', '-L', '-k']);
const METHOD_FLAGS = new Set(['-X', '--request']);
const HEADER_FLAGS = new Set(['-H', '--header']);
const DATA_FLAGS = new Set(['-d', '--data', '--data-raw', '--data-binary']);
const USER_FLAGS = new Set(['-u', '--user']);

const isWhitespace = (char: string): boolean => /\s/.test(char);

const tokenize = (command: string): Tokens => {
  const tokens: string[] = [];
  let current = '';
  let inToken = false;
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < command.length; index += 1) {
    const char = command.charAt(index);
    const next = command.charAt(index + 1);

    if (quote === "'") {
      if (char === "'") quote = null;
      else current += char;
    } else if (char === '\\' && next === '\n') {
      index += 1;
    } else if (char === '\\' && next === '\r' && command.charAt(index + 2) === '\n') {
      index += 2;
    } else if (quote === '"') {
      if (char === '"') {
        quote = null;
      } else if (char === '\\' && DOUBLE_QUOTE_ESCAPES.has(next)) {
        current += next;
        index += 1;
      } else {
        current += char;
      }
    } else if (char === "'" || char === '"') {
      quote = char;
      inToken = true;
    } else if (char === '\\' && next !== '') {
      current += next;
      inToken = true;
      index += 1;
    } else if (isWhitespace(char)) {
      if (inToken) tokens.push(current);
      current = '';
      inToken = false;
    } else {
      current += char;
      inToken = true;
    }
  }

  if (quote) return { error: 'Unclosed quote' };
  if (inToken) tokens.push(current);
  return { tokens };
};

const toBase64 = (text: string): string =>
  btoa(Array.from(new TextEncoder().encode(text), (byte) => String.fromCodePoint(byte)).join(''));

export const parseCurl = (command: string): CurlRequest | CurlError => {
  const tokenized = tokenize(command);
  if ('error' in tokenized) return tokenized;

  const [first, ...rest] = tokenized.tokens;
  if (first !== 'curl') return { error: `Unsupported command ${first ?? ''}`.trim() };

  let url: string | undefined;
  let method: string | undefined;
  const headers: [string, string][] = [];
  const bodies: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index] ?? '';

    if (IGNORED_FLAGS.has(token)) continue;

    if (METHOD_FLAGS.has(token) || HEADER_FLAGS.has(token) || DATA_FLAGS.has(token)) {
      index += 1;
      const value = rest[index];
      if (value === undefined) return { error: `Missing value for ${token}` };

      if (METHOD_FLAGS.has(token)) {
        method = value.toUpperCase();
      } else if (HEADER_FLAGS.has(token)) {
        const separator = value.indexOf(':');
        if (separator === -1) return { error: `Invalid header ${value}` };
        headers.push([value.slice(0, separator).trim(), value.slice(separator + 1).trim()]);
      } else {
        bodies.push(value);
      }
    } else if (USER_FLAGS.has(token)) {
      index += 1;
      const value = rest[index];
      if (value === undefined) return { error: `Missing value for ${token}` };
      headers.push(['Authorization', `Basic ${toBase64(value)}`]);
    } else if (token.startsWith('-')) {
      return { error: `Unsupported option ${token}` };
    } else if (url === undefined) {
      url = token;
    } else {
      return { error: `Unexpected argument ${token}` };
    }
  }

  if (url === undefined) return { error: 'No URL' };

  const hasBody = bodies.length > 0;
  const request: CurlRequest = {
    url,
    method: method ?? (hasBody ? 'POST' : 'GET'),
    headers,
  };
  return hasBody ? { ...request, body: bodies.join('&') } : request;
};

export const toFetch = (request: CurlRequest): string => {
  const options: string[] = [];

  if (request.method !== 'GET') {
    options.push(`method: ${JSON.stringify(request.method)}`);
  }
  if (request.headers.length > 0) {
    const entries = request.headers.map(
      ([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`
    );
    options.push(`headers: { ${entries.join(', ')} }`);
  }
  if (request.body !== undefined) {
    options.push(`body: ${JSON.stringify(request.body)}`);
  }

  const url = JSON.stringify(request.url);
  return options.length === 0
    ? `await fetch(${url});`
    : `await fetch(${url}, { ${options.join(', ')} });`;
};
