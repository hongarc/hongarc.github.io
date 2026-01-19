/**
 * ShortcutManager - Central Registry for Keyboard Shortcuts
 *
 * Implements the Registry Pattern to manage all shortcuts
 * and dispatch key events to the appropriate commands.
 */

import * as R from 'ramda';

import { trackInteraction } from '@/lib/analytics';

import type {
  ExecutionContext,
  IShortcutManager,
  KeyBinding,
  ShortcutCommand,
  ShortcutContext,
  ShortcutDisplayInfo,
} from './types';

/**
 * Check if a key event matches a key binding
 */
function matchesBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
  const isMac = /mac/i.test(globalThis.navigator.userAgent);

  // Check modifiers
  const modifiers = binding.modifiers ?? {};
  const wantsCtrl = modifiers.ctrl ?? false;
  const wantsMeta = modifiers.meta ?? false;
  const wantsShift = modifiers.shift ?? false;
  const wantsAlt = modifiers.alt ?? false;

  // On Mac, Ctrl shortcuts typically use Meta (Cmd)
  const wantsModKey = wantsCtrl || wantsMeta;
  const hasModKey = isMac ? event.metaKey : event.ctrlKey;

  if (wantsModKey && !hasModKey) return false;
  if (!wantsModKey && hasModKey) return false;
  if (wantsShift && !event.shiftKey) return false;
  if (!wantsShift && event.shiftKey) return false;
  if (wantsAlt && !event.altKey) return false;

  // Check main key
  const eventKey = event.key;
  const bindingKey = binding.key;

  if (binding.caseSensitive === false) {
    // Match both cases
    return eventKey.toLowerCase() === bindingKey.toLowerCase();
  }

  return eventKey === bindingKey;
}

/**
 * Format a key binding for display
 */
function formatBinding(binding: KeyBinding): string[] {
  const keys: string[] = [];
  const isMac = /mac/i.test(globalThis.navigator.userAgent);

  if (binding.modifiers?.ctrl || binding.modifiers?.meta) {
    keys.push(isMac ? '\u2318' : 'Ctrl');
  }
  if (binding.modifiers?.shift) {
    keys.push('Shift');
  }
  if (binding.modifiers?.alt) {
    keys.push(isMac ? '\u2325' : 'Alt');
  }

  // Format special keys
  const keyMap: Record<string, string> = {
    ArrowUp: '\u2191',
    ArrowDown: '\u2193',
    ArrowLeft: '\u2190',
    ArrowRight: '\u2192',
    Escape: 'Esc',
    Backspace: '\u232B',
    Enter: '\u23CE',
    ' ': 'Space',
  };

  const displayKey = keyMap[binding.key] ?? binding.key.toUpperCase();
  keys.push(displayKey);

  return keys;
}

/**
 * ShortcutManager class - implements IShortcutManager interface
 */
export class ShortcutManager implements IShortcutManager {
  private commands = new Map<string, ShortcutCommand>();

  /**
   * Register a new command
   */
  register(command: ShortcutCommand): void {
    if (this.commands.has(command.id)) {
      console.warn(`ShortcutManager: Overwriting command "${command.id}"`);
    }
    this.commands.set(command.id, command);
  }

  /**
   * Register multiple commands at once
   */
  registerAll(commands: ShortcutCommand[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }

  /**
   * Unregister a command by ID
   */
  unregister(commandId: string): void {
    this.commands.delete(commandId);
  }

  /**
   * Get all registered commands
   */
  getAll(): ShortcutCommand[] {
    return [...this.commands.values()];
  }

  /**
   * Get commands for a specific context
   */
  getByContext(context: ShortcutContext): ShortcutCommand[] {
    return this.getAll().filter(
      (cmd) => cmd.contexts.includes(context) || cmd.contexts.includes('global')
    );
  }

  /**
   * Get display information for all commands
   */
  getDisplayInfo(): ShortcutDisplayInfo[] {
    return this.getAll().map((cmd) => ({
      id: cmd.id,
      keys: cmd.bindings.flatMap((binding) => formatBinding(binding)),
      description: cmd.description,
      category: cmd.category,
      contexts: cmd.contexts,
    }));
  }

  /**
   * Handle a keyboard event
   * Returns true if a command was executed
   */
  handleKeyEvent(ctx: ExecutionContext): boolean {
    const { event, activeSection } = ctx;

    // Determine current context
    const currentContext: ShortcutContext = activeSection === 'blog' ? 'blog' : 'tools';

    // Get commands sorted by priority (higher first)
    const filteredCommands = this.getAll().filter(
      (cmd) => cmd.contexts.includes(currentContext) || cmd.contexts.includes('global')
    );
    // Use Ramda sort to avoid mutating original array
    const sortedCommands = R.sort(
      R.descend((cmd: ShortcutCommand) => cmd.priority ?? 0),
      filteredCommands
    );

    for (const command of sortedCommands) {
      // Check if any binding matches
      const matchingBinding = command.bindings.find((binding) => matchesBinding(event, binding));

      if (matchingBinding && command.canExecute(ctx)) {
        event.preventDefault();
        void command.execute(ctx);

        // Track keyboard interaction
        trackInteraction(command.id, 'keyboard');

        return true;
      }
    }

    return false;
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
  }
}

// Singleton instance
export const shortcutManager = new ShortcutManager();
