/**
 * Keyboard Shortcut System Types
 *
 * Design Patterns Used:
 * - Command Pattern: Each shortcut is a command with execute/canExecute
 * - Strategy Pattern: Different behaviors for different contexts
 * - Registry Pattern: Central management of all shortcuts
 */

import type { NavigateFunction } from 'react-router-dom';

import type { NavigationSection } from '@/blog/types';

// Context in which shortcuts operate
export type ShortcutContext = 'global' | 'tools' | 'blog';

// Shortcut categories for UI grouping
export type ShortcutCategory = 'navigation' | 'actions' | 'general' | 'blog';

// Key modifiers
export interface KeyModifiers {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

// Key combination definition
export interface KeyBinding {
  key: string; // The main key (e.g., 'k', 'ArrowUp', '/')
  modifiers?: KeyModifiers;
  /** Whether to match both lowercase and uppercase */
  caseSensitive?: boolean;
}

// Dependencies that commands might need
export interface ShortcutDependencies {
  navigate: NavigateFunction;
  // Store actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearInputs: () => void;
  copyToClipboard: () => Promise<boolean>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveSection: (section: NavigationSection) => void;
  // Store state
  getState: () => {
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
    searchQuery: string;
    selectedToolId: string | null;
    activeSection: NavigationSection;
    pinnedToolIds: string[];
  };
  // Handlers from parent
  onOpenPalette?: () => void;
  onToggleHelp?: () => void;
}

// Execution context passed to commands
export interface ExecutionContext {
  event: KeyboardEvent;
  isInputFocused: boolean;
  currentPath: string;
  activeSection: NavigationSection;
  deps: ShortcutDependencies;
}

// Command interface (Command Pattern)
export interface ShortcutCommand {
  /** Unique identifier for the command */
  id: string;
  /** Human-readable description */
  description: string;
  /** Key bindings that trigger this command (multiple bindings allowed) */
  bindings: KeyBinding[];
  /** Category for UI grouping */
  category: ShortcutCategory;
  /** Context(s) where this command is active */
  contexts: ShortcutContext[];
  /** Priority for conflict resolution (higher = checked first) */
  priority?: number;
  /** Check if command can execute in current state */
  canExecute: (ctx: ExecutionContext) => boolean;
  /** Execute the command */
  execute: (ctx: ExecutionContext) => void | Promise<void>;
}

// Shortcut definition for UI display
export interface ShortcutDisplayInfo {
  id: string;
  keys: string[];
  description: string;
  category: ShortcutCategory;
  contexts: ShortcutContext[];
}

// Manager interface (Registry Pattern)
export interface IShortcutManager {
  register(command: ShortcutCommand): void;
  unregister(commandId: string): void;
  getAll(): ShortcutCommand[];
  getByContext(context: ShortcutContext): ShortcutCommand[];
  getDisplayInfo(): ShortcutDisplayInfo[];
  handleKeyEvent(ctx: ExecutionContext): boolean;
}

// Strategy interface for context-specific behaviors (Strategy Pattern)
export interface IShortcutStrategy {
  context: ShortcutContext;
  getCommands(deps: ShortcutDependencies): ShortcutCommand[];
}
