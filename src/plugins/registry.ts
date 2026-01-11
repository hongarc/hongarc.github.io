import { groupBy, map, pipe, prop, sort } from 'ramda';

import type { Category, GroupedPlugins, ToolPlugin } from '@/types/plugin';
import { CATEGORY_ORDER } from '@/types/plugin';

/**
 * Fuzzy search scoring - returns score 0-1 (higher is better match)
 */
const fuzzyScore = (query: string, text: string): number => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match
  if (t === q) return 1;

  // Contains exact query
  if (t.includes(q)) return 0.9;

  // Fuzzy character matching
  let qIdx = 0;
  let score = 0;
  let consecutive = 0;

  for (let tIdx = 0; tIdx < t.length && qIdx < q.length; tIdx++) {
    if (t[tIdx] === q[qIdx]) {
      score += 1 + consecutive * 0.5; // Bonus for consecutive matches
      consecutive++;
      qIdx++;
    } else {
      consecutive = 0;
    }
  }

  // All query chars must be found
  if (qIdx < q.length) return 0;

  // Normalize by query length and add penalty for longer texts
  return (score / q.length) * (q.length / t.length) * 0.8;
};

/**
 * Calculate fuzzy match score for a plugin
 */
const getPluginScore =
  (query: string) =>
  (plugin: ToolPlugin): number => {
    const scores = [
      fuzzyScore(query, plugin.label) * 1.5, // Label weighted higher
      fuzzyScore(query, plugin.description),
      ...(plugin.keywords ?? []).map((k) => fuzzyScore(query, k) * 1.2),
    ];
    return Math.max(...scores);
  };

/**
 * Plugin Registry - manages all registered tools
 */
class PluginRegistry {
  private plugins = new Map<string, ToolPlugin>();

  /**
   * Register a plugin
   */
  register(plugin: ToolPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with id "${plugin.id}" is already registered. Skipping.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Register multiple plugins at once
   */
  registerAll(plugins: ToolPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  /**
   * Get a plugin by ID
   */
  get(id: string): ToolPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all registered plugins
   */
  getAll(): ToolPlugin[] {
    return [...this.plugins.values()];
  }

  /**
   * Get plugins grouped by category using Ramda
   */
  getGroupedByCategory(): GroupedPlugins {
    const plugins = this.getAll();
    return groupBy(prop('category'), plugins);
  }

  /**
   * Get plugins for a specific category
   */
  getByCategory(category: Category): ToolPlugin[] {
    return this.getAll().filter((p) => p.category === category);
  }

  /**
   * Search plugins using fuzzy matching
   */
  search(query: string): ToolPlugin[] {
    if (!query.trim()) {
      return this.getAll();
    }

    const normalizedQuery = query.trim();
    const scorePlugin = getPluginScore(normalizedQuery);
    const minScore = 0.1; // Minimum score threshold

    // Score and filter plugins
    const scored = this.getAll()
      .map((plugin) => ({ plugin, score: scorePlugin(plugin) }))
      .filter(({ score }) => score >= minScore);

    // Sort by score descending
    return pipe(
      () => scored,
      sort((a, b) => b.score - a.score),
      map(({ plugin }) => plugin)
    )();
  }

  /**
   * Get categories that have plugins, in the correct order
   */
  getActiveCategories(): Category[] {
    const grouped = this.getGroupedByCategory();
    return CATEGORY_ORDER.filter((cat) => grouped[cat] && grouped[cat].length > 0);
  }

  /**
   * Get total plugin count
   */
  get count(): number {
    return this.plugins.size;
  }

  /**
   * Clear all plugins (useful for testing)
   */
  clear(): void {
    this.plugins.clear();
  }
}

// Singleton instance
export const registry = new PluginRegistry();

// Export type for the registry
export type { PluginRegistry };
