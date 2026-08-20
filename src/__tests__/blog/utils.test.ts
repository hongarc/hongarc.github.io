import { describe, expect, it } from 'vitest';

import type { BlogPost } from '@/blog/types';
import {
  countWords,
  extractUniqueTags,
  filterByTag,
  filterPublished,
  getByTagSorted,
  getPublishedSorted,
  getRecentPosts,
  groupByTag,
  isNonEmptyArray,
  isNonEmptyString,
  isStringArray,
  isValidDateString,
  postMatchesSearch,
  searchPosts,
  sortByDateDesc,
  truncateAtWord,
} from '@/blog/utils';

const post = (overrides: Partial<BlogPost> & { slug: string }): BlogPost => ({
  title: `Title ${overrides.slug}`,
  description: 'A description',
  content: 'Body content',
  publishedAt: new Date('2024-01-01'),
  tags: [],
  readingTime: 1,
  isDraft: false,
  ...overrides,
});

const older = post({ slug: 'older', publishedAt: new Date('2024-01-01'), tags: ['a'] });
const newer = post({ slug: 'newer', publishedAt: new Date('2024-06-01'), tags: ['a', 'zeta'] });
const draft = post({ slug: 'draft', publishedAt: new Date('2024-12-01'), isDraft: true });

describe('blog utils', () => {
  describe('guards', () => {
    it('recognises non-empty strings', () => {
      expect(isNonEmptyString('a')).toBe(true);
      expect(isNonEmptyString(' '.repeat(3))).toBe(false);
      expect(isNonEmptyString(3)).toBe(false);
    });

    it('validates date strings', () => {
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('not a date')).toBe(false);
    });

    it('recognises non-empty and string arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([])).toBe(false);
      expect(isStringArray(['a'])).toBe(true);
      expect(isStringArray(['a', 1])).toBe(false);
    });
  });

  describe('filtering', () => {
    it('drops drafts without mutating the input', () => {
      const input = [older, draft, newer];
      expect(filterPublished(input).map((p) => p.slug)).toStrictEqual(['older', 'newer']);
      expect(input).toHaveLength(3);
    });

    it('filters by tag', () => {
      expect(filterByTag('zeta')([older, newer]).map((p) => p.slug)).toStrictEqual(['newer']);
      expect(filterByTag('missing')([older, newer])).toStrictEqual([]);
    });
  });

  describe('sorting', () => {
    it('sorts newest first without mutating the input', () => {
      const input = [older, newer];
      expect(sortByDateDesc(input).map((p) => p.slug)).toStrictEqual(['newer', 'older']);
      expect(input.map((p) => p.slug)).toStrictEqual(['older', 'newer']);
    });

    it('composes published-and-sorted', () => {
      expect(getPublishedSorted([older, draft, newer]).map((p) => p.slug)).toStrictEqual([
        'newer',
        'older',
      ]);
    });

    it('composes by-tag-and-sorted', () => {
      expect(getByTagSorted('a')([older, newer]).map((p) => p.slug)).toStrictEqual([
        'newer',
        'older',
      ]);
    });
  });

  describe('tags', () => {
    it('extracts unique tags in sorted order', () => {
      expect(extractUniqueTags([older, newer])).toStrictEqual(['a', 'zeta']);
    });

    it('groups posts under each of their tags', () => {
      const grouped = groupByTag([older, newer]);
      expect(new Set(Object.keys(grouped))).toStrictEqual(new Set(['a', 'zeta']));
      expect(grouped.a?.map((p) => p.slug)).toStrictEqual(['older', 'newer']);
      expect(grouped.zeta?.map((p) => p.slug)).toStrictEqual(['newer']);
    });
  });

  describe('search', () => {
    it('returns every post when the query is blank', () => {
      const input = [older, newer];
      expect(searchPosts(' '.repeat(3))(input)).toStrictEqual(input);
    });

    it('matches on title, description, content and tags', () => {
      expect(searchPosts('newer')([older, newer]).map((p) => p.slug)).toStrictEqual(['newer']);
      // content is searched too, so a body word matches
      expect(searchPosts('body')([older]).map((p) => p.slug)).toStrictEqual(['older']);
      // tag-only match
      expect(searchPosts('zeta')([older, newer]).map((p) => p.slug)).toStrictEqual(['newer']);
      expect(searchPosts('nothing here')([older, newer])).toStrictEqual([]);
    });

    it('matches a single post, ignoring its body', () => {
      expect(postMatchesSearch('older')(older)).toBe(true);
      expect(postMatchesSearch('body content')(older)).toBe(false);
    });
  });

  describe('text helpers', () => {
    it('counts words, ignoring extra whitespace', () => {
      expect(countWords('one  two\nthree ')).toBe(3);
      expect(countWords('')).toBe(0);
    });

    it('truncates at a word boundary', () => {
      expect(truncateAtWord(20)('short text')).toBe('short text');
      // a late space (past 80% of the limit) is used as the cut point
      expect(truncateAtWord(10)('abcdefghi jklmn')).toBe('abcdefghi...');
      // an early space is not, so the hard slice stands
      expect(truncateAtWord(12)('one two three four')).toBe('one two thre...');
      // no space at all in the window
      expect(truncateAtWord(10)('aaaaaaaaaaaa bbbb')).toBe('aaaaaaaaaa...');
    });
  });

  describe('getRecentPosts', () => {
    it('takes the newest N published posts', () => {
      expect(getRecentPosts(1)([older, draft, newer]).map((p) => p.slug)).toStrictEqual(['newer']);
      expect(getRecentPosts(5)([older, newer])).toHaveLength(2);
      expect(getRecentPosts(0)([older, newer])).toStrictEqual([]);
    });
  });
});
