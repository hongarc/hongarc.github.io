/**
 * Tool Commands - Specific to the tools section
 */

import { registry } from '@/plugins/registry';
import { CATEGORY_ORDER } from '@/types/plugin';

import type { ShortcutCommand, ShortcutDependencies } from '../types';

/**
 * Get tools in sidebar display order (pinned first, then by category)
 */
function getOrderedTools(deps: ShortcutDependencies) {
  const allTools = registry.getAll();
  const grouped = registry.getGroupedByCategory();
  const pinnedToolIds = deps.getState().pinnedToolIds;

  // Pinned tools first
  const pinned = pinnedToolIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t) => t !== undefined);

  // Then tools by category order (excluding pinned to avoid duplicates)
  const pinnedSet = new Set(pinnedToolIds);
  const byCategory = CATEGORY_ORDER.flatMap(
    (cat) => grouped[cat]?.filter((t) => !pinnedSet.has(t.id)) ?? []
  );

  return [...pinned, ...byCategory];
}

/**
 * Navigate to next tool
 */
export const nextToolCommand: ShortcutCommand = {
  id: 'tools.next-tool',
  description: 'Next tool',
  bindings: [{ key: 'j', caseSensitive: false }, { key: 'ArrowDown' }],
  category: 'navigation',
  contexts: ['tools'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    const orderedTools = getOrderedTools(ctx.deps);
    if (orderedTools.length === 0) return;

    const selectedToolId = ctx.deps.getState().selectedToolId;
    const currentIndex = orderedTools.findIndex((t) => t.id === selectedToolId);
    const newIndex = currentIndex < orderedTools.length - 1 ? currentIndex + 1 : 0;

    const newTool = orderedTools[newIndex];
    if (newTool) {
      void ctx.deps.navigate(`/${newTool.id}`);
    }
  },
};

/**
 * Navigate to previous tool
 */
export const prevToolCommand: ShortcutCommand = {
  id: 'tools.prev-tool',
  description: 'Previous tool',
  bindings: [{ key: 'k', caseSensitive: false }, { key: 'ArrowUp' }],
  category: 'navigation',
  contexts: ['tools'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    const orderedTools = getOrderedTools(ctx.deps);
    if (orderedTools.length === 0) return;

    const selectedToolId = ctx.deps.getState().selectedToolId;
    const currentIndex = orderedTools.findIndex((t) => t.id === selectedToolId);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : orderedTools.length - 1;

    const newTool = orderedTools[newIndex];
    if (newTool) {
      void ctx.deps.navigate(`/${newTool.id}`);
    }
  },
};

/**
 * Clear all inputs
 */
export const clearInputsCommand: ShortcutCommand = {
  id: 'tools.clear-inputs',
  description: 'Clear inputs',
  bindings: [{ key: 'Backspace', modifiers: { ctrl: true } }],
  category: 'actions',
  contexts: ['tools'],
  canExecute: (ctx) => !ctx.isInputFocused,
  execute: (ctx) => {
    ctx.deps.clearInputs();
  },
};

/**
 * Export all tool commands
 */
export const toolCommands: ShortcutCommand[] = [
  nextToolCommand,
  prevToolCommand,
  clearInputsCommand,
];
