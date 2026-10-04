import { describe, expect, it } from 'vitest';

import { formatStatusLine, HTTP_STATUSES, lookupStatus } from '@/domain/network/http-status';

const isAscending = (values: readonly number[]): boolean =>
  values.every((value, index) => index === 0 || (values[index - 1] ?? 0) < value);

const codes = (query: string): number[] => lookupStatus(query).map((status) => status.code);

describe('HTTP_STATUSES', () => {
  it('has unique codes in ascending order within 100-511', () => {
    const all = HTTP_STATUSES.map((status) => status.code);
    expect(new Set(all).size).toBe(all.length);
    expect(isAscending(all)).toBe(true);
    expect(all[0]).toBe(100);
    expect(all.at(-1)).toBe(511);
  });

  it('gives every entry a non-empty name and description', () => {
    for (const status of HTTP_STATUSES) {
      expect(status.name.trim()).not.toBe('');
      expect(status.description.trim()).not.toBe('');
    }
  });
});

describe('lookupStatus', () => {
  it('finds a single code', () => {
    expect(lookupStatus('404')).toEqual([
      {
        code: 404,
        name: 'Not Found',
        description: 'The server cannot find the requested resource.',
      },
    ]);
    expect(lookupStatus('429')[0]?.name).toBe('Too Many Requests');
  });

  it('returns nothing for an unregistered code', () => {
    expect(lookupStatus('299')).toEqual([]);
    expect(lookupStatus('999')).toEqual([]);
  });

  it('returns a whole class for 4xx, 4XX or a single digit', () => {
    const fourxx = lookupStatus('4xx');
    expect(fourxx[0]).toMatchObject({ code: 400, name: 'Bad Request' });
    expect(fourxx.at(-1)?.code).toBe(451);
    expect(fourxx.every((status) => status.code >= 400 && status.code < 500)).toBe(true);
    expect(codes('4XX')).toEqual(codes('4xx'));
    expect(codes('4')).toEqual(codes('4xx'));
  });

  it('returns every 5xx for 5, ending with 511', () => {
    const fivexx = lookupStatus('5');
    expect(fivexx.at(-1)).toMatchObject({ code: 511, name: 'Network Authentication Required' });
    expect(fivexx.every((status) => status.code >= 500)).toBe(true);
  });

  it('returns nothing for a class with no entries', () => {
    expect(lookupStatus('6')).toEqual([]);
    expect(lookupStatus('6xx')).toEqual([]);
  });

  it('matches a keyword in the name', () => {
    expect(lookupStatus('teapot')).toEqual([
      expect.objectContaining({ code: 418, name: "I'm a teapot" }),
    ]);
    expect(codes('Not Found')).toContain(404);
    expect(codes('not found')).toEqual(codes('Not Found'));
  });

  it('matches a keyword in the description', () => {
    expect(codes('rate')).toContain(429);
    expect(lookupStatus('rate').every((s) => /rate/i.test(`${s.name} ${s.description}`))).toBe(
      true
    );
  });

  it('returns nothing for an unmatched keyword', () => {
    expect(lookupStatus('abc')).toEqual([]);
  });

  it('ignores surrounding whitespace', () => {
    expect(codes('  404  ')).toEqual([404]);
    expect(codes(' 4xx ')).toEqual(codes('4xx'));
    expect(codes('  teapot\n')).toEqual([418]);
  });

  it('returns the whole list for an empty or blank query', () => {
    expect(lookupStatus('')).toEqual(HTTP_STATUSES);
    expect(lookupStatus(' \t\n ')).toEqual(HTTP_STATUSES);
  });

  it('returns results sorted by code', () => {
    const result = codes('server');
    expect(isAscending(result)).toBe(true);
  });
});

describe('formatStatusLine', () => {
  it('formats code, name and description on one line', () => {
    expect(lookupStatus('404').map((status) => formatStatusLine(status))).toEqual([
      '404 Not Found — The server cannot find the requested resource.',
    ]);
  });
});
