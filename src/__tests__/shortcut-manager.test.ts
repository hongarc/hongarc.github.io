import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShortcutManager } from '@/keyboard/shortcut-manager';
import type { ExecutionContext, ShortcutCommand } from '@/keyboard/types';

vi.mock('@/lib/analytics', () => ({
  trackInteraction: vi.fn(),
}));

const command = (
  id: string,
  priority: number | undefined,
  onExecute: (id: string) => void,
  overrides: Partial<ShortcutCommand> = {}
): ShortcutCommand => ({
  id,
  description: id,
  bindings: [{ key: 'k' }],
  category: 'actions',
  contexts: ['global'],
  priority,
  canExecute: () => true,
  execute: () => {
    onExecute(id);
  },
  ...overrides,
});

// A stub rather than a real KeyboardEvent: these tests run in the node
// environment, and the manager only reads the key, the modifiers, and
// preventDefault.
const keyEvent = (key: string): KeyboardEvent =>
  ({
    key,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
  }) as unknown as KeyboardEvent;

const context = (key = 'k'): ExecutionContext =>
  ({
    event: keyEvent(key),
    isInputFocused: false,
    currentPath: '/',
    activeSection: 'tools',
    deps: {},
  }) as unknown as ExecutionContext;

describe('shortcut manager', () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    manager = new ShortcutManager();
  });

  it('registers and unregisters commands', () => {
    manager.register(command('a', 1, vi.fn()));
    expect(manager.getAll()).toHaveLength(1);

    manager.unregister('a');
    expect(manager.getAll()).toHaveLength(0);
  });

  it('runs the highest-priority command when bindings collide', () => {
    const executed: string[] = [];
    // Registered lowest-priority first, so ordering cannot come from insertion order
    manager.registerAll([
      command('low', 1, (id) => executed.push(id)),
      command('high', 99, (id) => executed.push(id)),
      command('middle', 50, (id) => executed.push(id)),
    ]);

    expect(manager.handleKeyEvent(context())).toBe(true);
    expect(executed).toStrictEqual(['high']);
  });

  it('treats a missing priority as the lowest', () => {
    const executed: string[] = [];
    manager.registerAll([
      command('no-priority', undefined, (id) => executed.push(id)),
      command('with-priority', 5, (id) => executed.push(id)),
    ]);

    expect(manager.handleKeyEvent(context())).toBe(true);
    expect(executed).toStrictEqual(['with-priority']);
  });

  it('does not mutate the registration order while sorting', () => {
    manager.registerAll([command('low', 1, vi.fn()), command('high', 99, vi.fn())]);

    const before = manager.getAll().map((c) => c.id);
    manager.handleKeyEvent(context());

    expect(manager.getAll().map((c) => c.id)).toStrictEqual(before);
  });

  it('skips commands that cannot execute', () => {
    const executed: string[] = [];
    manager.registerAll([
      command('blocked', 99, (id) => executed.push(id), { canExecute: () => false }),
      command('allowed', 1, (id) => executed.push(id)),
    ]);

    expect(manager.handleKeyEvent(context())).toBe(true);
    expect(executed).toStrictEqual(['allowed']);
  });

  it('reports when nothing matches', () => {
    manager.register(command('a', 1, vi.fn(), { bindings: [{ key: 'z' }] }));
    expect(manager.handleKeyEvent(context())).toBe(false);
  });

  it('filters by context', () => {
    manager.register(command('blog-only', 1, vi.fn(), { contexts: ['blog'] }));
    expect(manager.getByContext('blog').map((c) => c.id)).toStrictEqual(['blog-only']);
    // activeSection 'tools' means a blog-only command must not fire
    expect(manager.handleKeyEvent(context())).toBe(false);
  });

  it('clears all commands', () => {
    manager.registerAll([command('a', 1, vi.fn()), command('b', 2, vi.fn())]);
    manager.clear();
    expect(manager.getAll()).toHaveLength(0);
  });
});
