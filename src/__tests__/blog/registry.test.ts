import { beforeEach, describe, expect, it } from 'vitest';

import { BlogRegistry } from '@/blog/registry';
import type { BlogPost } from '@/blog/types';

const createMockPost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  slug: 'test-post',
  title: 'Test Post',
  description: 'A test blog post',
  content: 'This is test content',
  publishedAt: new Date('2024-01-15'),
  tags: ['test', 'blog'],
  readingTime: 2,
  isDraft: false,
  ...overrides,
});

describe('BlogRegistry', () => {
  let registry: BlogRegistry;

  beforeEach(() => {
    registry = new BlogRegistry();
  });

  describe('register', () => {
    it('should register a blog post', () => {
      const post = createMockPost();
      registry.register(post);

      expect(registry.get('test-post')).toBe(post);
      expect(registry.count).toBe(1);
    });

    it('should not register duplicate posts', () => {
      const post1 = createMockPost();
      const post2 = createMockPost({ title: 'Different Title' });

      registry.register(post1);
      registry.register(post2);

      expect(registry.count).toBe(1);
      expect(registry.get('test-post')?.title).toBe('Test Post');
    });
  });

  describe('getPublished', () => {
    it('should return only published posts', () => {
      const publishedPost = createMockPost({ slug: 'published' });
      const draftPost = createMockPost({ slug: 'draft', isDraft: true });

      registry.register(publishedPost);
      registry.register(draftPost);

      const published = registry.getPublished();
      expect(published).toHaveLength(1);
      expect(published[0]?.slug).toBe('published');
    });
  });

  describe('getByTag', () => {
    it('should return posts with specific tag', () => {
      const post1 = createMockPost({ slug: 'post1', tags: ['react', 'typescript'] });
      const post2 = createMockPost({ slug: 'post2', tags: ['vue', 'javascript'] });
      const post3 = createMockPost({ slug: 'post3', tags: ['react', 'javascript'] });

      registry.registerAll([post1, post2, post3]);

      const reactPosts = registry.getByTag('react');
      expect(reactPosts).toHaveLength(2);
      expect(reactPosts.map((p) => p.slug)).toEqual(['post1', 'post3']);
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags sorted', () => {
      const post1 = createMockPost({ slug: 'post1', tags: ['react', 'typescript'] });
      const post2 = createMockPost({ slug: 'post2', tags: ['vue', 'javascript'] });
      const post3 = createMockPost({ slug: 'post3', tags: ['react', 'javascript'] });

      registry.registerAll([post1, post2, post3]);

      const tags = registry.getAllTags();
      expect(tags).toEqual(['javascript', 'react', 'typescript', 'vue']);
    });
  });

  describe('search', () => {
    it('should search by title, description, and content', () => {
      const post1 = createMockPost({
        slug: 'post1',
        title: 'React Tutorial',
        description: 'Learn React basics',
        content: 'This post covers React fundamentals',
      });
      const post2 = createMockPost({
        slug: 'post2',
        title: 'Vue Guide',
        description: 'Vue.js introduction',
        content: 'This post covers Vue basics',
      });

      registry.registerAll([post1, post2]);

      const reactResults = registry.search('React');
      expect(reactResults).toHaveLength(1);
      expect(reactResults[0]?.slug).toBe('post1');

      const vueResults = registry.search('Vue');
      expect(vueResults).toHaveLength(1);
      expect(vueResults[0]?.slug).toBe('post2');
    });

    it('should return all posts for empty query', () => {
      const post1 = createMockPost({ slug: 'post1' });
      const post2 = createMockPost({ slug: 'post2' });

      registry.registerAll([post1, post2]);

      const results = registry.search('');
      expect(results).toHaveLength(2);
    });

    it('should search by tags', () => {
      const post1 = createMockPost({
        slug: 'post1',
        title: 'Post One',
        tags: ['typescript', 'react'],
      });
      const post2 = createMockPost({
        slug: 'post2',
        title: 'Post Two',
        tags: ['javascript', 'vue'],
      });

      registry.registerAll([post1, post2]);

      const results = registry.search('typescript');
      expect(results).toHaveLength(1);
      expect(results[0]?.slug).toBe('post1');
    });

    it('should be case-insensitive', () => {
      const post = createMockPost({
        slug: 'post1',
        title: 'React Tutorial',
      });

      registry.register(post);

      expect(registry.search('react')).toHaveLength(1);
      expect(registry.search('REACT')).toHaveLength(1);
      expect(registry.search('ReAcT')).toHaveLength(1);
    });

    it('should handle whitespace-only query', () => {
      const post = createMockPost({ slug: 'post1' });
      registry.register(post);

      const results = registry.search('   ');
      expect(results).toHaveLength(1);
    });
  });

  describe('getAllSorted', () => {
    it('should return all posts sorted by date (newest first)', () => {
      const oldPost = createMockPost({ slug: 'old', publishedAt: new Date('2024-01-01') });
      const newPost = createMockPost({ slug: 'new', publishedAt: new Date('2024-12-01') });
      const midPost = createMockPost({ slug: 'mid', publishedAt: new Date('2024-06-15') });

      registry.registerAll([oldPost, newPost, midPost]);

      const sorted = registry.getAllSorted();
      expect(sorted.map((p) => p.slug)).toEqual(['new', 'mid', 'old']);
    });

    it('should include drafts in sorted list', () => {
      const published = createMockPost({ slug: 'published', publishedAt: new Date('2024-01-01') });
      const draft = createMockPost({
        slug: 'draft',
        isDraft: true,
        publishedAt: new Date('2024-12-01'),
      });

      registry.registerAll([published, draft]);

      const sorted = registry.getAllSorted();
      expect(sorted).toHaveLength(2);
      expect(sorted[0]?.slug).toBe('draft');
    });
  });

  describe('getPublished sorting', () => {
    it('should return published posts sorted by date (newest first)', () => {
      const oldPost = createMockPost({ slug: 'old', publishedAt: new Date('2024-01-01') });
      const newPost = createMockPost({ slug: 'new', publishedAt: new Date('2024-12-01') });
      const midPost = createMockPost({ slug: 'mid', publishedAt: new Date('2024-06-15') });

      registry.registerAll([oldPost, newPost, midPost]);

      const published = registry.getPublished();
      expect(published.map((p) => p.slug)).toEqual(['new', 'mid', 'old']);
    });
  });

  describe('getPublishedByTag', () => {
    it('should return published posts with specific tag, sorted by date', () => {
      const oldReact = createMockPost({
        slug: 'old-react',
        tags: ['react'],
        publishedAt: new Date('2024-01-01'),
      });
      const newReact = createMockPost({
        slug: 'new-react',
        tags: ['react'],
        publishedAt: new Date('2024-12-01'),
      });
      const draftReact = createMockPost({
        slug: 'draft-react',
        tags: ['react'],
        isDraft: true,
        publishedAt: new Date('2024-06-15'),
      });
      const vuePost = createMockPost({
        slug: 'vue-post',
        tags: ['vue'],
        publishedAt: new Date('2024-03-01'),
      });

      registry.registerAll([oldReact, newReact, draftReact, vuePost]);

      const reactPosts = registry.getPublishedByTag('react');
      expect(reactPosts).toHaveLength(2);
      expect(reactPosts.map((p) => p.slug)).toEqual(['new-react', 'old-react']);
    });

    it('should return empty array for non-existent tag', () => {
      const post = createMockPost({ slug: 'post1', tags: ['react'] });
      registry.register(post);

      const results = registry.getPublishedByTag('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('publishedCount', () => {
    it('should return count of published posts only', () => {
      const published1 = createMockPost({ slug: 'pub1' });
      const published2 = createMockPost({ slug: 'pub2' });
      const draft = createMockPost({ slug: 'draft', isDraft: true });

      registry.registerAll([published1, published2, draft]);

      expect(registry.count).toBe(3);
      expect(registry.publishedCount).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all posts', () => {
      const post1 = createMockPost({ slug: 'post1' });
      const post2 = createMockPost({ slug: 'post2' });

      registry.registerAll([post1, post2]);
      expect(registry.count).toBe(2);

      registry.clear();
      expect(registry.count).toBe(0);
      expect(registry.getAll()).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent slug', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getAllTags with empty posts', () => {
    it('should return empty array when no posts have tags', () => {
      const post = createMockPost({ slug: 'post1', tags: [] });
      registry.register(post);

      expect(registry.getAllTags()).toEqual([]);
    });

    it('should return empty array when no posts exist', () => {
      expect(registry.getAllTags()).toEqual([]);
    });
  });
});
