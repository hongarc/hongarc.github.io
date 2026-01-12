/**
 * useShortcuts - React hook for keyboard shortcuts
 *
 * Uses the ShortcutManager to handle keyboard events
 * in a context-aware manner.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useToolStore } from '@/store/tool-store';

import { getAllCommands } from './commands';
import { ShortcutManager } from './shortcut-manager';
import type { ExecutionContext, ShortcutDependencies, ShortcutDisplayInfo } from './types';

interface ShortcutHandlers {
  onToggleHelp?: () => void;
  onOpenPalette?: () => void;
}

/**
 * Create a shortcut manager instance with all commands
 */
function createShortcutManager(): ShortcutManager {
  const manager = new ShortcutManager();
  manager.registerAll(getAllCommands());
  return manager;
}

/**
 * Get display info for shortcuts (for help modal)
 */
export function getShortcutDisplayInfo(): ShortcutDisplayInfo[] {
  const manager = createShortcutManager();
  return manager.getDisplayInfo();
}

/**
 * Main hook for keyboard shortcuts
 */
export function useShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    sidebarCollapsed,
    copyToClipboard,
    clearInputs,
    selectedToolId,
    theme,
    setTheme,
    setActiveSection,
    pinnedToolIds,
    activeSection,
  } = useToolStore();

  // Create manager once
  const manager = useMemo(() => createShortcutManager(), []);

  // Create dependencies object
  const deps: ShortcutDependencies = useMemo(
    () => ({
      navigate,
      toggleSidebar,
      setSidebarCollapsed: (collapsed: boolean) => {
        if (collapsed !== sidebarCollapsed) {
          toggleSidebar();
        }
      },
      setSearchQuery,
      clearInputs,
      copyToClipboard,
      setTheme,
      setActiveSection,
      getState: () => ({
        theme,
        sidebarCollapsed,
        searchQuery,
        selectedToolId,
        activeSection,
        pinnedToolIds,
      }),
      onOpenPalette: handlers.onOpenPalette,
      onToggleHelp: handlers.onToggleHelp,
    }),
    [
      navigate,
      toggleSidebar,
      sidebarCollapsed,
      setSearchQuery,
      clearInputs,
      copyToClipboard,
      setTheme,
      setActiveSection,
      theme,
      searchQuery,
      selectedToolId,
      activeSection,
      pinnedToolIds,
      handlers.onOpenPalette,
      handlers.onToggleHelp,
    ]
  );

  // Key event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Determine active section from URL
      const currentSection = location.pathname.startsWith('/blog') ? 'blog' : 'tools';

      const ctx: ExecutionContext = {
        event,
        isInputFocused,
        currentPath: location.pathname,
        activeSection: currentSection,
        deps,
      };

      manager.handleKeyEvent(ctx);
    },
    [deps, location.pathname, manager]
  );

  // Attach event listener
  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { manager };
}
