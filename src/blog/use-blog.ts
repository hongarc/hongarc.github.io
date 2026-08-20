import { useEffect, useSyncExternalStore } from 'react';

import { blogRegistry } from './registry';
import type { BlogPost } from './types';

/**
 * Blog posts are registered on demand.
 *
 * Building them means parsing markdown frontmatter, which pulls the YAML parser
 * (~100 kB) plus the post sources themselves — none of which a visitor who only
 * uses the tools should download. The first caller of ensureBlogPosts() loads
 * the registration module; the registry then notifies its subscribers, so the
 * hooks below re-render once posts land.
 */
let registration: Promise<void> | null = null;

export const ensureBlogPosts = (): Promise<void> => {
  registration ??= import('./init').then(({ registerSamplePosts }) => registerSamplePosts());
  return registration;
};

/** Trigger registration once, for components that always need posts. */
export function useEnsureBlogPosts(): void {
  useEffect(() => {
    void ensureBlogPosts();
  }, []);
}

/** Published posts, newest first. Subscribes only — does not trigger loading. */
export function useBlogPosts(): BlogPost[] {
  return useSyncExternalStore(blogRegistry.subscribe, blogRegistry.getPublishedSnapshot);
}

/** All tags. Subscribes only — does not trigger loading. */
export function useBlogTags(): string[] {
  return useSyncExternalStore(blogRegistry.subscribe, blogRegistry.getTagsSnapshot);
}

/**
 * Changes whenever posts are registered. Use as a dependency for reads that are
 * not one of the cached snapshots above, such as looking a post up by slug.
 */
export function useBlogVersion(): number {
  return useSyncExternalStore(blogRegistry.subscribe, blogRegistry.getVersionSnapshot);
}
