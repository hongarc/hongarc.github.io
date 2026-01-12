/**
 * Keyboard Shortcuts Hook
 *
 * Re-exports from the new modular keyboard system for backward compatibility.
 *
 * @deprecated Import from '@/keyboard' instead for the full API
 */

import type { ShortcutCategory } from '@/keyboard';

export { useShortcuts as useKeyboardShortcuts, getShortcutDisplayInfo } from '@/keyboard';

// Legacy type for backward compatibility
export interface ShortcutDef {
  keys: string[];
  description: string;
  category: ShortcutCategory;
}

// Legacy SHORTCUTS array for backward compatibility with UI components
// This is a static array since we can't call hooks at module level
export const SHORTCUTS: ShortcutDef[] = [
  // Navigation - Global
  { keys: ['/', '\u2318K'], description: 'Command palette', category: 'navigation' },
  { keys: ['B'], description: 'Toggle sidebar', category: 'navigation' },
  { keys: ['\u2318['], description: 'Collapse sidebar', category: 'navigation' },
  { keys: ['\u2318]'], description: 'Expand sidebar', category: 'navigation' },
  { keys: ['H'], description: 'Go home', category: 'navigation' },
  { keys: ['T'], description: 'Go to tools', category: 'navigation' },
  { keys: ['G'], description: 'Go to blog', category: 'navigation' },

  // Navigation - Tools
  { keys: ['\u2191', 'K'], description: 'Previous tool', category: 'navigation' },
  { keys: ['\u2193', 'J'], description: 'Next tool', category: 'navigation' },

  // Navigation - Blog
  { keys: ['J/K'], description: 'Scroll in post', category: 'blog' },
  { keys: ['\u2190', 'H'], description: 'Previous post', category: 'blog' },
  { keys: ['\u2192', 'L'], description: 'Next post', category: 'blog' },
  { keys: ['S'], description: 'Search posts', category: 'blog' },
  { keys: ['Esc'], description: 'Back to list', category: 'blog' },

  // Actions
  { keys: ['D'], description: 'Toggle dark mode', category: 'actions' },
  { keys: ['\u2318\u21E7C'], description: 'Copy output', category: 'actions' },
  { keys: ['\u2318\u232B'], description: 'Clear inputs', category: 'actions' },

  // General
  { keys: ['\u2318/'], description: 'Show shortcuts', category: 'general' },
  { keys: ['Esc'], description: 'Clear / unfocus', category: 'general' },
];
