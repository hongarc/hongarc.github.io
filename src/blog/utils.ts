/**
 * Blog utility functions using Ramda for functional programming
 */

import * as R from 'ramda';

import type { BlogPost } from './types';

/**
 * String utilities
 */
export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

export const isValidDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));

/**
 * Array utilities
 */
export const isNonEmptyArray = (arr: unknown[]): boolean => arr.length > 0;

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/**
 * Blog post utilities using Ramda
 */

// Sort posts by date (newest first)
export const sortByDateDesc = (posts: BlogPost[]): BlogPost[] =>
  // eslint-disable-next-line unicorn/no-array-sort -- toSorted has type issues
  [...posts].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

// Filter published posts
export const filterPublished = R.filter<BlogPost>((post) => !post.isDraft);

// Filter by tag
export const filterByTag = (tag: string) => R.filter<BlogPost>((post) => post.tags.includes(tag));

// Get unique tags from posts
export const extractUniqueTags = R.pipe(
  R.chain<BlogPost, string>((post) => post.tags),
  R.uniq,
  // eslint-disable-next-line unicorn/no-array-sort -- toSorted has type issues
  (tags: string[]) => [...tags].sort()
);

// Search posts by query
export const searchPosts = (query: string) => {
  if (!query.trim()) {
    return R.identity<BlogPost[]>;
  }

  const normalizedQuery = query.toLowerCase().trim();
  return R.filter<BlogPost>(
    (post) =>
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.description.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
};

// Get published posts sorted by date
export const getPublishedSorted = R.pipe(filterPublished, sortByDateDesc);

// Get posts by tag, sorted by date
export const getByTagSorted = (tag: string) => R.pipe(filterByTag(tag), sortByDateDesc);

// Count words in text
export const countWords = R.pipe(
  R.split(/\s+/),
  R.filter((word: string) => word.length > 0),
  R.length
);

// Truncate text at word boundary
export const truncateAtWord =
  (maxLength: number) =>
  (text: string): string => {
    if (text.length <= maxLength) {
      return text;
    }

    const truncated = text.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.8) {
      return `${truncated.slice(0, lastSpaceIndex)}...`;
    }

    return `${truncated}...`;
  };

// Format date to human readable
export const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Group posts by tag
export const groupByTag = (posts: BlogPost[]): Record<string, BlogPost[]> => {
  const result: Record<string, BlogPost[]> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      result[tag] ??= [];
      result[tag].push(post);
    }
  }

  return result;
};

// Get recent posts (limit)
export const getRecentPosts = (limit: number): ((posts: BlogPost[]) => BlogPost[]) =>
  R.pipe(getPublishedSorted, (posts: BlogPost[]) => R.take(limit, posts));

// Check if post matches search criteria
export const postMatchesSearch =
  (query: string) =>
  (post: BlogPost): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    return (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.description.toLowerCase().includes(normalizedQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  };
