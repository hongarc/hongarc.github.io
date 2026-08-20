import type { BlogPost, BlogRegistryInterface } from './types';

/**
 * Blog Registry - manages all registered blog posts
 * Similar to the existing plugin registry pattern
 */
export class BlogRegistry implements BlogRegistryInterface {
  private posts = new Map<string, BlogPost>();

  /**
   * Posts are registered asynchronously (parsing frontmatter loads the YAML
   * parser on demand), so consumers subscribe instead of reading once. The
   * snapshots below are cached so useSyncExternalStore sees a stable reference
   * between registrations and does not re-render forever.
   */
  private listeners = new Set<() => void>();

  private publishedSnapshot: BlogPost[] = [];

  private tagsSnapshot: string[] = [];

  private version = 0;

  /** Subscribe to registration changes. Returns an unsubscribe function. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Cached list of published posts — stable identity between registrations. */
  getPublishedSnapshot = (): BlogPost[] => this.publishedSnapshot;

  /** Cached list of tags — stable identity between registrations. */
  getTagsSnapshot = (): string[] => this.tagsSnapshot;

  /** Bumped on every registration, for reads that are not a plain list. */
  getVersionSnapshot = (): number => this.version;

  private notify(): void {
    this.version += 1;
    this.publishedSnapshot = this.getPublished();
    this.tagsSnapshot = this.getAllTags();
    for (const listener of this.listeners) listener();
  }

  /**
   * Register a blog post
   */
  register(post: BlogPost): void {
    if (this.posts.has(post.slug)) {
      console.warn(`Blog post with slug "${post.slug}" is already registered. Skipping.`);
      return;
    }
    this.posts.set(post.slug, post);
    this.notify();
  }

  /**
   * Register multiple blog posts at once
   */
  registerAll(posts: BlogPost[]): void {
    for (const post of posts) {
      this.register(post);
    }
  }

  /**
   * Get a blog post by slug
   */
  get(slug: string): BlogPost | undefined {
    return this.posts.get(slug);
  }

  /**
   * Get all registered blog posts
   */
  getAll(): BlogPost[] {
    return [...this.posts.values()];
  }

  /**
   * Get only published blog posts (excludes drafts), sorted by date (newest first)
   */
  getPublished(): BlogPost[] {
    const published = this.getAll().filter((post) => !post.isDraft);
    // eslint-disable-next-line unicorn/no-array-sort -- toSorted has type inference issues
    return [...published].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  /**
   * Get all posts sorted by publication date (newest first)
   */
  getAllSorted(): BlogPost[] {
    // eslint-disable-next-line unicorn/no-array-sort -- toSorted has type inference issues
    return [...this.getAll()].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  /**
   * Get published posts by tag, sorted by date (newest first)
   */
  getPublishedByTag(tag: string): BlogPost[] {
    return this.getPublished().filter((post) => post.tags.includes(tag));
  }

  /**
   * Get blog posts by tag
   */
  getByTag(tag: string): BlogPost[] {
    return this.getAll().filter((post) => post.tags.includes(tag));
  }

  /**
   * Get all unique tags from all posts
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    for (const post of this.getAll()) {
      for (const tag of post.tags) tagSet.add(tag);
    }
    // eslint-disable-next-line unicorn/no-array-sort -- toSorted not available in ES2022
    return [...tagSet].sort();
  }

  /**
   * Search blog posts by title, description, or content
   */
  search(query: string): BlogPost[] {
    if (!query.trim()) {
      return this.getAll();
    }

    const normalizedQuery = query.toLowerCase().trim();
    return this.getAll().filter((post) => {
      return (
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.description.toLowerCase().includes(normalizedQuery) ||
        post.content.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  }

  /**
   * Get total post count
   */
  get count(): number {
    return this.posts.size;
  }

  /**
   * Get published post count
   */
  get publishedCount(): number {
    return this.getPublished().length;
  }

  /**
   * Clear all posts (useful for testing)
   */
  clear(): void {
    this.posts.clear();
  }
}

// Singleton instance
export const blogRegistry = new BlogRegistry();
