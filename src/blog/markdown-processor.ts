import { marked } from 'marked';
import * as R from 'ramda';
import { parse as parseYaml } from 'yaml';

import type { BlogMetadata, ParsedMarkdown } from './types';

/**
 * Utility functions using Ramda
 */
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const isValidDateString = (value: string): boolean => !Number.isNaN(Date.parse(value));

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const allNonEmpty = R.all((tag: string) => tag.trim() !== '');

/**
 * Strip markdown formatting using Ramda pipe
 */
const stripMarkdown = R.pipe(
  // Remove code blocks first (before inline code)
  (s: string) => s.replaceAll(/```[\s\S]*?```/g, ''),
  // Remove headers
  (s: string) => s.replaceAll(/^#{1,6}\s+/gm, ''),
  // Remove images completely
  (s: string) => s.replaceAll(/!\[[\d\w\s]*\]\([^)]+\)/g, ''),
  // Remove links, keep text
  (s: string) => s.replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
  // Remove bold
  (s: string) => s.replaceAll(/\*\*(.*?)\*\*/g, '$1'),
  // Remove italic
  (s: string) => s.replaceAll(/\*(.*?)\*/g, '$1'),
  // Remove inline code
  (s: string) => s.replaceAll(/`(.*?)`/g, '$1'),
  // Remove list markers
  (s: string) => s.replaceAll(/^\s*[-*+]\s+/gm, ''),
  // Remove blockquote markers
  (s: string) => s.replaceAll(/^\s*>\s+/gm, ''),
  // Replace newlines with spaces
  (s: string) => s.replaceAll(/\n+/g, ' '),
  // Normalize multiple spaces
  (s: string) => s.replaceAll(/\s+/g, ' '),
  R.trim
);

/**
 * Browser-compatible frontmatter parser
 * Extracts YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): { data: unknown; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = frontmatterRegex.exec(content);

  if (!match) {
    return { data: {}, content };
  }

  try {
    const yamlContent = match[1] ?? '';
    const markdownContent = match[2] ?? '';
    const data: unknown = parseYaml(yamlContent);
    return { data, content: markdownContent };
  } catch {
    return { data: {}, content };
  }
}

/**
 * Validation errors for blog metadata
 */
export class BlogMetadataError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'BlogMetadataError';
  }
}

/**
 * Required fields for blog post metadata
 */
const REQUIRED_FIELDS = ['title', 'description', 'publishedAt'] as const;

/**
 * Validates blog metadata and ensures required fields are present
 */
function validateMetadata(data: unknown): BlogMetadata {
  if (!data || typeof data !== 'object') {
    throw new BlogMetadataError('Frontmatter must be an object');
  }

  const metadata = data as Record<string, unknown>;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const value = metadata[field];
    if (value === undefined || value === null) {
      throw new BlogMetadataError(`Missing required field: ${field}`, field);
    }
    if (!isNonEmptyString(value)) {
      throw new BlogMetadataError(`Field '${field}' must be a non-empty string`, field);
    }
  }

  // Validate publishedAt is a valid date string
  const publishedAt = metadata.publishedAt as string;
  if (!isValidDateString(publishedAt)) {
    throw new BlogMetadataError(`Field 'publishedAt' must be a valid date string`, 'publishedAt');
  }

  // Validate optional updatedAt
  if (
    metadata.updatedAt !== undefined &&
    (!isNonEmptyString(metadata.updatedAt) || !isValidDateString(metadata.updatedAt))
  ) {
    throw new BlogMetadataError(`Field 'updatedAt' must be a valid date string`, 'updatedAt');
  }

  // Validate optional tags
  if (metadata.tags !== undefined) {
    if (!isStringArray(metadata.tags)) {
      throw new BlogMetadataError(`Field 'tags' must be an array`, 'tags');
    }
    if (!allNonEmpty(metadata.tags)) {
      throw new BlogMetadataError(`All tags must be non-empty strings`, 'tags');
    }
  }

  // Validate optional isDraft
  if (metadata.isDraft !== undefined && typeof metadata.isDraft !== 'boolean') {
    throw new BlogMetadataError(`Field 'isDraft' must be a boolean`, 'isDraft');
  }

  // Validate optional author
  if (metadata.author !== undefined && !isNonEmptyString(metadata.author)) {
    throw new BlogMetadataError(`Field 'author' must be a non-empty string`, 'author');
  }

  return {
    title: metadata.title as string,
    description: metadata.description as string,
    publishedAt: metadata.publishedAt as string,
    updatedAt: metadata.updatedAt,
    tags: metadata.tags ?? [],
    isDraft: metadata.isDraft ?? false,
    author: metadata.author,
  };
}

/**
 * Markdown processor interface
 */
export interface MarkdownProcessorInterface {
  parse(content: string): ParsedMarkdown;
  renderToHtml(markdown: string): Promise<string>;
  extractExcerpt(content: string, maxLength?: number): string;
}

/**
 * Markdown processor implementation
 */
export class MarkdownProcessor implements MarkdownProcessorInterface {
  constructor() {
    // Configure marked for better security and features
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: false, // Don't convert \n to <br>
    });
  }

  /**
   * Parse markdown content with frontmatter
   */
  parse(content: string): ParsedMarkdown {
    try {
      const parsed = parseFrontmatter(content);
      const metadata = validateMetadata(parsed.data);

      return {
        metadata,
        content: parsed.content,
      };
    } catch (error) {
      if (error instanceof BlogMetadataError) {
        throw error;
      }
      throw new BlogMetadataError(
        `Failed to parse markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Render markdown content to HTML
   */
  async renderToHtml(markdown: string): Promise<string> {
    try {
      return await marked(markdown);
    } catch (error) {
      throw new Error(
        `Failed to render markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract excerpt from markdown content
   */
  extractExcerpt(content: string, maxLength = 200): string {
    const plainText = stripMarkdown(content);

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete word within the limit
    const truncated = plainText.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.8) {
      return `${truncated.slice(0, lastSpaceIndex)}...`;
    }

    return `${truncated}...`;
  }
}

// Singleton instance
export const markdownProcessor = new MarkdownProcessor();
