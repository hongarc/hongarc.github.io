import { beforeEach, describe, expect, it } from 'vitest';

import { registry } from '@/plugins/registry';
import type { Category, ToolPlugin } from '@/types/plugin';

const plugin = (
  id: string,
  category: Category,
  label = id,
  keywords: string[] = []
): ToolPlugin => ({
  id,
  label,
  description: `${label} description`,
  category,
  icon: undefined,
  keywords,
  inputs: [],
  transformer: () => ({ success: true, output: '' }),
});

describe('plugin registry', () => {
  beforeEach(() => {
    registry.clear();
  });

  it('registers and reads back plugins', () => {
    const json = plugin('json', 'format');
    registry.register(json);

    expect(registry.get('json')).toBe(json);
    expect(registry.count).toBe(1);
    expect(registry.getAll()).toHaveLength(1);
  });

  it('groups plugins by category', () => {
    registry.registerAll([
      plugin('json', 'format'),
      plugin('sql', 'format'),
      plugin('hash', 'crypto'),
    ]);

    const grouped = registry.getGroupedByCategory();

    expect(new Set(Object.keys(grouped))).toStrictEqual(new Set(['crypto', 'format']));
    expect(grouped.format?.map((p) => p.id)).toStrictEqual(['json', 'sql']);
    expect(grouped.crypto?.map((p) => p.id)).toStrictEqual(['hash']);
  });

  it('returns plugins for a single category', () => {
    registry.registerAll([plugin('json', 'format'), plugin('hash', 'crypto')]);

    expect(registry.getByCategory('format').map((p) => p.id)).toStrictEqual(['json']);
    expect(registry.getByCategory('text')).toStrictEqual([]);
  });

  it('lists active categories in the configured order', () => {
    registry.registerAll([plugin('hash', 'crypto'), plugin('json', 'format')]);

    // CATEGORY_ORDER puts format before crypto
    expect(registry.getActiveCategories()).toStrictEqual(['format', 'crypto']);
  });

  it('orders search results by descending score', () => {
    registry.registerAll([
      plugin('unrelated', 'text', 'Totally Different'),
      plugin('json', 'format', 'JSON Formatter', ['json']),
    ]);

    const results = registry.search('json');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.id).toBe('json');
  });

  it('clears every registration', () => {
    registry.register(plugin('json', 'format'));
    registry.clear();

    expect(registry.count).toBe(0);
    expect(registry.get('json')).toBeUndefined();
  });
});
