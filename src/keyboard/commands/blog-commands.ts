/**
 * Blog Commands - Specific to the blog section
 *
 * Different shortcuts for blog navigation:
 * - J/K or Up/Down: Scroll within a post
 * - Left/Right or H/L: Navigate between posts
 * - / or S: Focus search
 * - Escape: Exit search or go back to list
 */

import { blogRegistry } from '@/blog';

import type { ShortcutCommand } from '../types';

/**
 * Get published blog posts sorted by date
 */
function getPublishedPosts() {
  return blogRegistry.getPublished();
}

/**
 * Get current post slug from URL
 */
function getCurrentPostSlug(path: string): string | null {
  const match = /^\/blog\/([^/]+)$/.exec(path);
  return match?.[1] ?? null;
}

/**
 * Check if we're on a blog post page
 */
function isOnPostPage(path: string): boolean {
  return /^\/blog\/[^/]+$/.test(path) && !path.includes('/tag/');
}

/**
 * Scroll content up within a blog post
 */
export const scrollUpCommand: ShortcutCommand = {
  id: 'blog.scroll-up',
  description: 'Scroll up in post',
  bindings: [{ key: 'k', caseSensitive: false }, { key: 'ArrowUp' }],
  category: 'blog',
  contexts: ['blog'],
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: () => {
    // Scroll the main content area up
    const mainContent = document.querySelector('main');
    mainContent?.scrollBy({ top: -100, behavior: 'smooth' });
  },
};

/**
 * Scroll content down within a blog post
 */
export const scrollDownCommand: ShortcutCommand = {
  id: 'blog.scroll-down',
  description: 'Scroll down in post',
  bindings: [{ key: 'j', caseSensitive: false }, { key: 'ArrowDown' }],
  category: 'blog',
  contexts: ['blog'],
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: () => {
    // Scroll the main content area down
    const mainContent = document.querySelector('main');
    mainContent?.scrollBy({ top: 100, behavior: 'smooth' });
  },
};

/**
 * Navigate to previous blog post
 */
export const prevPostCommand: ShortcutCommand = {
  id: 'blog.prev-post',
  description: 'Previous post',
  bindings: [{ key: 'ArrowLeft' }, { key: 'h', caseSensitive: false }],
  category: 'blog',
  contexts: ['blog'],
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: (ctx) => {
    const currentSlug = getCurrentPostSlug(ctx.currentPath);
    if (!currentSlug) return;

    const posts = getPublishedPosts();
    const currentIndex = posts.findIndex((p) => p.slug === currentSlug);

    if (currentIndex > 0) {
      const prevPost = posts[currentIndex - 1];
      if (prevPost) {
        void ctx.deps.navigate(`/blog/${prevPost.slug}`);
      }
    }
  },
};

/**
 * Navigate to next blog post
 */
export const nextPostCommand: ShortcutCommand = {
  id: 'blog.next-post',
  description: 'Next post',
  bindings: [{ key: 'ArrowRight' }, { key: 'l', caseSensitive: false }],
  category: 'blog',
  contexts: ['blog'],
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: (ctx) => {
    const currentSlug = getCurrentPostSlug(ctx.currentPath);
    if (!currentSlug) return;

    const posts = getPublishedPosts();
    const currentIndex = posts.findIndex((p) => p.slug === currentSlug);

    if (currentIndex !== -1 && currentIndex < posts.length - 1) {
      const nextPost = posts[currentIndex + 1];
      if (nextPost) {
        void ctx.deps.navigate(`/blog/${nextPost.slug}`);
      }
    }
  },
};

/**
 * Focus search input in blog section
 */
export const focusSearchCommand: ShortcutCommand = {
  id: 'blog.focus-search',
  description: 'Search posts',
  bindings: [{ key: 's', caseSensitive: false }],
  category: 'blog',
  contexts: ['blog'],
  priority: 80,
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: () => {
    // Find and focus the search input in sidebar
    const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
    searchInput?.focus();
  },
};

/**
 * Go back to blog list from a post
 */
export const backToListCommand: ShortcutCommand = {
  id: 'blog.back-to-list',
  description: 'Back to blog list',
  bindings: [{ key: 'Escape' }],
  category: 'blog',
  contexts: ['blog'],
  priority: 60, // Lower than global escape
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: (ctx) => {
    void ctx.deps.navigate('/blog');
  },
};

/**
 * Scroll to top of post
 */
export const scrollToTopCommand: ShortcutCommand = {
  id: 'blog.scroll-to-top',
  description: 'Scroll to top',
  bindings: [{ key: 'g' }, { key: 'Home' }],
  category: 'blog',
  contexts: ['blog'],
  priority: 70,
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: () => {
    const mainContent = document.querySelector('main');
    mainContent?.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/**
 * Scroll to bottom of post
 */
export const scrollToBottomCommand: ShortcutCommand = {
  id: 'blog.scroll-to-bottom',
  description: 'Scroll to bottom',
  bindings: [{ key: 'G', modifiers: { shift: true } }, { key: 'End' }],
  category: 'blog',
  contexts: ['blog'],
  priority: 70,
  canExecute: (ctx) => !ctx.isInputFocused && isOnPostPage(ctx.currentPath),
  execute: () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
    }
  },
};

/**
 * Navigate posts with J/K on blog list page (not post page)
 */
export const nextPostInListCommand: ShortcutCommand = {
  id: 'blog.next-in-list',
  description: 'Next post in list',
  bindings: [{ key: 'j', caseSensitive: false }, { key: 'ArrowDown' }],
  category: 'blog',
  contexts: ['blog'],
  priority: 50,
  canExecute: (ctx) => !ctx.isInputFocused && !isOnPostPage(ctx.currentPath),
  execute: (ctx) => {
    const posts = getPublishedPosts();
    if (posts.length > 0 && posts[0]) {
      void ctx.deps.navigate(`/blog/${posts[0].slug}`);
    }
  },
};

/**
 * Export all blog commands
 */
export const blogCommands: ShortcutCommand[] = [
  scrollUpCommand,
  scrollDownCommand,
  prevPostCommand,
  nextPostCommand,
  focusSearchCommand,
  backToListCommand,
  scrollToTopCommand,
  scrollToBottomCommand,
  nextPostInListCommand,
];
