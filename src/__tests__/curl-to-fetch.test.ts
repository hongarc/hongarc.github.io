import { describe, expect, it } from 'vitest';

import { parseCurl, toFetch } from '@/domain/network/curl-to-fetch';

const convert = (command: string): string => {
  const parsed = parseCurl(command);
  if ('error' in parsed) return `error: ${parsed.error}`;
  return toFetch(parsed);
};

describe('curl to fetch: ticket examples', () => {
  it('converts a plain GET', () => {
    expect(convert('curl https://api.example.com/users')).toBe(
      'await fetch("https://api.example.com/users");'
    );
  });

  it('keeps a non-GET method from -X', () => {
    expect(convert('curl -X DELETE https://api.example.com/users/7')).toBe(
      'await fetch("https://api.example.com/users/7", { method: "DELETE" });'
    );
  });

  it('collects repeated headers with single and double quotes', () => {
    expect(convert(`curl -H 'Accept: application/json' -H "X-Id: 1" https://a.b/c`)).toBe(
      'await fetch("https://a.b/c", { headers: { "Accept": "application/json", "X-Id": "1" } });'
    );
  });

  it('turns a body into POST and escapes it', () => {
    expect(convert(`curl https://a.b/c -d '{"a":1}' -H 'Content-Type: application/json'`)).toBe(
      String.raw`await fetch("https://a.b/c", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{\"a\":1}" });`
    );
  });

  it('turns -u into a Basic Authorization header', () => {
    expect(convert('curl -u alice:s3cret https://a.b/c')).toBe(
      'await fetch("https://a.b/c", { headers: { "Authorization": "Basic YWxpY2U6czNjcmV0" } });'
    );
  });

  it('joins backslash-newline line continuations', () => {
    expect(convert('curl -X PUT \\\n  https://a.b/c')).toBe(
      'await fetch("https://a.b/c", { method: "PUT" });'
    );
  });

  it('rejects an unknown flag naming it', () => {
    expect(convert('curl --frobnicate https://a.b/c')).toBe(
      'error: Unsupported option --frobnicate'
    );
  });

  it('rejects an unclosed quote', () => {
    expect(convert("curl -H 'Accept: x")).toBe('error: Unclosed quote');
    expect(convert('curl "https://a.b/c')).toBe('error: Unclosed quote');
  });

  it('rejects a command without a URL', () => {
    expect(convert('curl -X POST')).toBe('error: No URL');
  });
});

describe('parseCurl', () => {
  it('returns the structured request', () => {
    expect(parseCurl('curl -X post -d a=1 -d b=2 https://a.b/c')).toEqual({
      url: 'https://a.b/c',
      method: 'POST',
      headers: [],
      body: 'a=1&b=2',
    });
  });

  it('lets -X override the implied POST', () => {
    expect(parseCurl('curl -X PUT --data-raw x https://a.b/c')).toMatchObject({ method: 'PUT' });
    expect(parseCurl('curl --request PATCH --data-binary x https://a.b/c')).toMatchObject({
      method: 'PATCH',
      body: 'x',
    });
    expect(parseCurl('curl --data x https://a.b/c')).toMatchObject({ method: 'POST' });
  });

  it('accepts and ignores --compressed, -s, -L and -k', () => {
    expect(parseCurl('curl --compressed -s -L -k https://a.b/c')).toEqual({
      url: 'https://a.b/c',
      method: 'GET',
      headers: [],
    });
  });

  it('accepts long header and user options', () => {
    expect(parseCurl('curl --header "A:  b:c " --user u:p https://a.b/c')).toMatchObject({
      headers: [
        ['A', 'b:c'],
        ['Authorization', 'Basic dTpw'],
      ],
    });
  });

  it('base64-encodes non-ASCII credentials as UTF-8', () => {
    expect(parseCurl('curl -u é:x https://a.b/c')).toMatchObject({
      headers: [['Authorization', 'Basic w6k6eA==']],
    });
  });

  it('does not run escapes or continuations inside single quotes', () => {
    expect(parseCurl("curl -d 'a\\\nb\\n' https://a.b/c")).toMatchObject({ body: 'a\\\nb\\n' });
  });

  it('handles escapes in double quotes and outside quotes', () => {
    expect(parseCurl(String.raw`curl -d "say \"hi\" \\ \n" https://a.b/c`)).toMatchObject({
      body: String.raw`say "hi" \ \n`,
    });
    expect(parseCurl(String.raw`curl -d a\ b https://a.b/c`)).toMatchObject({ body: 'a b' });
    expect(parseCurl('curl -d "a\\\nb" https://a.b/c')).toMatchObject({ body: 'ab' });
  });

  it('handles CRLF line continuations and empty quoted arguments', () => {
    expect(parseCurl("curl -d '' \\\r\n https://a.b/c")).toMatchObject({
      url: 'https://a.b/c',
      body: '',
    });
  });

  it('treats a trailing lone backslash as a literal', () => {
    expect(parseCurl('curl https://a.b/c\\')).toMatchObject({ url: 'https://a.b/c\\' });
  });

  it('reports the other errors by token', () => {
    expect(parseCurl('')).toEqual({ error: 'Unsupported command' });
    expect(parseCurl('wget https://a.b/c')).toEqual({ error: 'Unsupported command wget' });
    expect(parseCurl('curl -H')).toEqual({ error: 'Missing value for -H' });
    expect(parseCurl('curl -u')).toEqual({ error: 'Missing value for -u' });
    expect(parseCurl('curl -H nocolon https://a.b/c')).toEqual({
      error: 'Invalid header nocolon',
    });
    expect(parseCurl('curl https://a.b/c https://d.e/f')).toEqual({
      error: 'Unexpected argument https://d.e/f',
    });
  });
});

describe('toFetch', () => {
  it('escapes strings with JSON.stringify and omits empty options', () => {
    expect(
      toFetch({ url: 'https://a.b/"x"', method: 'GET', headers: [], body: 'line\nbreak' })
    ).toBe(String.raw`await fetch("https://a.b/\"x\"", { body: "line\nbreak" });`);
  });
});
