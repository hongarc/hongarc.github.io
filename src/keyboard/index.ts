/**
 * Keyboard Shortcut System
 *
 * A modular, extensible keyboard shortcut system using design patterns:
 * - Command Pattern: Each shortcut is an encapsulated command
 * - Registry Pattern: Central management of all shortcuts
 * - Strategy Pattern: Context-aware behavior (tools vs blog)
 *
 * @example
 * ```tsx
 * import { useShortcuts } from '@/keyboard';
 *
 * function App() {
 *   useShortcuts({
 *     onOpenPalette: () => setShowPalette(true),
 *     onToggleHelp: () => setShowHelp(!showHelp),
 *   });
 *   // ...
 * }
 * ```
 */

export * from './types';
export * from './shortcut-manager';
export * from './commands';
export { useShortcuts, getShortcutDisplayInfo } from './use-shortcuts';
