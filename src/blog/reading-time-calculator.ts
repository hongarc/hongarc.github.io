/**
 * Reading time calculator utility
 * Calculates estimated reading time based on content analysis
 */

import * as R from 'ramda';

/**
 * Reading time calculation configuration
 */
interface ReadingTimeConfig {
  /** Words per minute for regular text */
  wordsPerMinute: number;
  /** Multiplier for code blocks (slower reading) */
  codeMultiplier: number;
  /** Seconds per image */
  secondsPerImage: number;
}

/**
 * Default reading time configuration based on research
 */
const DEFAULT_CONFIG: ReadingTimeConfig = {
  wordsPerMinute: 200, // Average adult reading speed
  codeMultiplier: 0.5, // Code is read 50% slower
  secondsPerImage: 12, // 12 seconds per image
};

/**
 * Reading time calculation result
 */
export interface ReadingTimeResult {
  /** Estimated reading time in minutes */
  minutes: number;
  /** Word count */
  words: number;
  /** Code block count */
  codeBlocks: number;
  /** Image count */
  images: number;
}

/**
 * Utility functions using Ramda
 */
const isNonEmpty = (word: string): boolean => word.length > 0;
const countWords = R.pipe(
  R.split(/\s+/),
  R.filter((word: string) => isNonEmpty(word)),
  R.length
);

const stripForWordCount = R.pipe(
  (s: string) => s.replaceAll(/```[\s\S]*?```/g, ''), // Remove code blocks
  (s: string) => s.replaceAll(/!\[[\d\w\s]*\]\([^)]+\)/g, ''), // Remove images
  (s: string) => s.replaceAll(/`[^`]+`/g, ''), // Remove inline code
  (s: string) => s.replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1'), // Keep link text only
  (s: string) => s.replaceAll(/[#*_~`]/g, ''), // Remove markdown formatting
  (s: string) => s.replaceAll(/\s+/g, ' '), // Normalize whitespace
  R.trim
);

const extractCodeBlockContent = (codeBlock: string): string =>
  codeBlock.replace(/```[\w]*\n?/, '').replace(/```$/, '');

/**
 * Calculate reading time for markdown content
 */
export function calculateReadingTime(
  content: string,
  config: Partial<ReadingTimeConfig> = {}
): ReadingTimeResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Remove frontmatter if present
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');

  // Count images
  const imageMatches = contentWithoutFrontmatter.match(/!\[[\d\w\s]*\]\([^)]+\)/g) ?? [];
  const images = imageMatches.length;

  // Extract and count code blocks
  const codeBlockMatches = contentWithoutFrontmatter.match(/```[\s\S]*?```/g) ?? [];
  const codeBlocks = codeBlockMatches.length;

  // Remove code blocks and images for word counting
  const textContent = stripForWordCount(contentWithoutFrontmatter);

  // Count words
  const words = countWords(textContent);

  // Count words in code blocks (they're read slower)
  const codeWords = R.pipe(
    R.map((block: string) => extractCodeBlockContent(block)),
    R.map((content: string) => countWords(content)),
    R.sum
  )(codeBlockMatches);

  // Calculate reading time
  const textReadingTime = words / finalConfig.wordsPerMinute;
  const codeReadingTime = codeWords / finalConfig.wordsPerMinute / finalConfig.codeMultiplier;
  const imageReadingTime = (images * finalConfig.secondsPerImage) / 60; // Convert to minutes

  const totalMinutes = textReadingTime + codeReadingTime + imageReadingTime;

  return {
    minutes: Math.max(1, Math.round(totalMinutes)), // Minimum 1 minute
    words: words + codeWords,
    codeBlocks,
    images,
  };
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${String(minutes)} min read`;
}

/**
 * Reading time calculator class for dependency injection
 */
export class ReadingTimeCalculator {
  constructor(private config: Partial<ReadingTimeConfig> = {}) {}

  calculate(content: string): ReadingTimeResult {
    return calculateReadingTime(content, this.config);
  }

  format(minutes: number): string {
    return formatReadingTime(minutes);
  }
}

// Singleton instance with default configuration
export const readingTimeCalculator = new ReadingTimeCalculator();
