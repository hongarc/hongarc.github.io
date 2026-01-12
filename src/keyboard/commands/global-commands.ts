/**
 * Global Commands - Work in all contexts
 */

import type { ShortcutCommand } from '../types';

/**
 * Toggle help/shortcuts panel
 */
export const toggleHelpCommand: ShortcutCommand = {
  id: 'global.toggle-help',
  description: 'Show shortcuts',
  bindings: [{ key: '/', modifiers: { ctrl: true } }],
  category: 'general',
  contexts: ['global'],
  priority: 100,
  canExecute: () => true,
  execute: (ctx) => {
    ctx.deps.onToggleHelp?.();
  },
};

/**
 * Open command palette
 */
export const openPaletteCommand: ShortcutCommand = {
  id: 'global.open-palette',
  description: 'Command palette',
  bindings: [
    { key: 'k', modifiers: { ctrl: true } },
    { key: '/', caseSensitive: false },
  ],
  category: 'navigation',
  contexts: ['global'],
  priority: 100,
  canExecute: (ctx) => !ctx.isInputFocused || ctx.event.ctrlKey || ctx.event.metaKey,
  execute: (ctx) => {
    ctx.deps.onOpenPalette?.();
  },
};

/**
 * Toggle dark mode
 */
export const toggleDarkModeCommand: ShortcutCommand = {
  id: 'global.toggle-dark-mode',
  description: 'Toggle dark mode',
  bindings: [{ key: 'd', caseSensitive: false }],
  category: 'actions',
  contexts: ['global'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    const state = ctx.deps.getState();
    ctx.deps.setTheme(state.theme === 'dark' ? 'light' : 'dark');
  },
};

/**
 * Toggle sidebar
 */
export const toggleSidebarCommand: ShortcutCommand = {
  id: 'global.toggle-sidebar',
  description: 'Toggle sidebar',
  bindings: [{ key: 'b', caseSensitive: false }],
  category: 'navigation',
  contexts: ['global'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    ctx.deps.toggleSidebar();
  },
};

/**
 * Collapse sidebar
 */
export const collapseSidebarCommand: ShortcutCommand = {
  id: 'global.collapse-sidebar',
  description: 'Collapse sidebar',
  bindings: [{ key: '[', modifiers: { ctrl: true } }],
  category: 'navigation',
  contexts: ['global'],
  priority: 90,
  canExecute: (ctx) => !ctx.deps.getState().sidebarCollapsed,
  execute: (ctx) => {
    ctx.deps.setSidebarCollapsed(true);
  },
};

/**
 * Expand sidebar
 */
export const expandSidebarCommand: ShortcutCommand = {
  id: 'global.expand-sidebar',
  description: 'Expand sidebar',
  bindings: [{ key: ']', modifiers: { ctrl: true } }],
  category: 'navigation',
  contexts: ['global'],
  priority: 90,
  canExecute: (ctx) => ctx.deps.getState().sidebarCollapsed,
  execute: (ctx) => {
    ctx.deps.setSidebarCollapsed(false);
  },
};

/**
 * Go home
 */
export const goHomeCommand: ShortcutCommand = {
  id: 'global.go-home',
  description: 'Go home',
  bindings: [{ key: 'h', caseSensitive: false }],
  category: 'navigation',
  contexts: ['global'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    ctx.deps.setActiveSection('tools');
    void ctx.deps.navigate('/');
  },
};

/**
 * Go to tools section
 */
export const goToolsCommand: ShortcutCommand = {
  id: 'global.go-tools',
  description: 'Go to tools',
  bindings: [{ key: 't', caseSensitive: false }],
  category: 'navigation',
  contexts: ['global'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    ctx.deps.setActiveSection('tools');
    void ctx.deps.navigate('/');
  },
};

/**
 * Go to blog section
 */
export const goBlogCommand: ShortcutCommand = {
  id: 'global.go-blog',
  description: 'Go to blog',
  bindings: [{ key: 'g', caseSensitive: false }],
  category: 'navigation',
  contexts: ['global'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    ctx.deps.setActiveSection('blog');
    void ctx.deps.navigate('/blog');
  },
};

/**
 * Escape - Clear search or blur input
 */
export const escapeCommand: ShortcutCommand = {
  id: 'global.escape',
  description: 'Clear / unfocus',
  bindings: [{ key: 'Escape' }],
  category: 'general',
  contexts: ['global'],
  priority: 50,
  canExecute: (ctx) => ctx.isInputFocused || ctx.deps.getState().searchQuery !== '',
  execute: (ctx) => {
    if (ctx.isInputFocused) {
      (ctx.event.target as HTMLElement).blur();
      return;
    }
    if (ctx.deps.getState().searchQuery) {
      ctx.deps.setSearchQuery('');
    }
  },
};

/**
 * Copy output to clipboard
 */
export const copyOutputCommand: ShortcutCommand = {
  id: 'global.copy-output',
  description: 'Copy output',
  bindings: [{ key: 'C', modifiers: { ctrl: true, shift: true } }],
  category: 'actions',
  contexts: ['global'],
  priority: 100, // Works even in input
  canExecute: () => true,
  execute: async (ctx) => {
    await ctx.deps.copyToClipboard();
  },
};

/**
 * Export all global commands
 */
export const globalCommands: ShortcutCommand[] = [
  toggleHelpCommand,
  openPaletteCommand,
  toggleDarkModeCommand,
  toggleSidebarCommand,
  collapseSidebarCommand,
  expandSidebarCommand,
  goHomeCommand,
  goToolsCommand,
  goBlogCommand,
  escapeCommand,
  copyOutputCommand,
];
