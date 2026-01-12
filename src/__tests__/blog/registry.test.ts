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
      expect(published[0].slug).toBe('published');
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
      expect(reactResults[0].slug).toBe('post1');

      const vueResults = registry.search('Vue');
      expect(vueResults).toHaveLength(1);
      expect(vueResults[0].slug).toBe('post2');
    });

    it('should return all posts for empty query', () => {
      const post1 = createMockPost({ slug: 'post1' });
      const post2 = createMockPost({ slug: 'post2' });

      registry.registerAll([post1, post2]);

      const results = registry.search('');
      expect(results).toHaveLength(2);
    });
  });
});
