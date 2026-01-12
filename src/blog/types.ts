/**
 * Core blog types and interfaces
 */

export interface BlogMetadata {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  isDraft?: boolean;
  author?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  readingTime: number;
  isDraft: boolean;
  author?: string;
  excerpt?: string;
}

export interface ParsedMarkdown {
  metadata: BlogMetadata;
  content: string;
}

export interface BlogRegistryInterface {
  register(post: BlogPost): void;
  get(slug: string): BlogPost | undefined;
  getAll(): BlogPost[];
  getAllSorted(): BlogPost[];
  getPublished(): BlogPost[];
  getByTag(tag: string): BlogPost[];
  getPublishedByTag(tag: string): BlogPost[];
  getAllTags(): string[];
  search(query: string): BlogPost[];
}

export type NavigationSection = 'tools' | 'blog';
