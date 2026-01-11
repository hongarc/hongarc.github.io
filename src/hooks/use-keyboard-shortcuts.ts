import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';

interface ShortcutHandlers {
  onToggleHelp?: () => void;
  onOpenPalette?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    toggleSidebar,
    sidebarCollapsed,
    copyToClipboard,
    clearInputs,
    selectedToolId,
  } = useToolStore();

  const openPalette = useCallback(() => {
    handlers.onOpenPalette?.();
  }, [handlers]);

  const navigateToTool = useCallback(
    (direction: 'next' | 'prev') => {
      const allTools = registry.getAll();
      if (allTools.length === 0) return;

      const currentIndex = allTools.findIndex((t) => t.id === selectedToolId);
      let newIndex: number;

      if (direction === 'next') {
        newIndex = currentIndex < allTools.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : allTools.length - 1;
      }

      const newTool = allTools[newIndex];
      if (newTool) {
        void navigate(`/${newTool.id}`);
      }
    },
    [navigate, selectedToolId]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = /mac/i.test(globalThis.navigator.userAgent);
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd/Ctrl + K - Open command palette
      if (modKey && event.key === 'k') {
        event.preventDefault();
        openPalette();
        return;
      }

      // Cmd/Ctrl + / - Toggle shortcuts help
      if (modKey && event.key === '/') {
        event.preventDefault();
        handlers.onToggleHelp?.();
        return;
      }

      // Cmd/Ctrl + [ - Collapse sidebar
      if (modKey && event.key === '[') {
        event.preventDefault();
        if (!sidebarCollapsed) {
          toggleSidebar();
        }
        return;
      }

      // Cmd/Ctrl + ] - Expand sidebar
      if (modKey && event.key === ']') {
        event.preventDefault();
        if (sidebarCollapsed) {
          toggleSidebar();
        }
        return;
      }

      // Cmd/Ctrl + Shift + C - Copy output (works even in input)
      if (modKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        void copyToClipboard();
        return;
      }

      // Escape - Clear search or blur input
      if (event.key === 'Escape') {
        if (isInputFocused) {
          target.blur();
          return;
        }
        if (searchQuery) {
          setSearchQuery('');
          return;
        }
      }

      // Don't handle navigation shortcuts when focused on input
      if (isInputFocused) return;

      // Cmd/Ctrl + Backspace - Clear inputs
      if (modKey && event.key === 'Backspace') {
        event.preventDefault();
        clearInputs();
        return;
      }

      // Arrow keys - Navigate tools
      if (event.key === 'ArrowDown' || event.key === 'j') {
        event.preventDefault();
        navigateToTool('next');
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'k') {
        event.preventDefault();
        navigateToTool('prev');
        return;
      }

      // / - Open command palette (vim-style)
      if (event.key === '/') {
        event.preventDefault();
        openPalette();
      }
    },
    [
      openPalette,
      handlers,
      sidebarCollapsed,
      toggleSidebar,
      copyToClipboard,
      searchQuery,
      setSearchQuery,
      clearInputs,
      navigateToTool,
    ]
  );

  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Shortcut definitions for help display
export interface ShortcutDef {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'general';
}

export const SHORTCUTS: ShortcutDef[] = [
  // Navigation
  { keys: ['/', 'Ctrl', 'K'], description: 'Command palette', category: 'navigation' },
  { keys: ['\u2191', 'K'], description: 'Previous tool', category: 'navigation' },
  { keys: ['\u2193', 'J'], description: 'Next tool', category: 'navigation' },
  { keys: ['Ctrl', '['], description: 'Collapse sidebar', category: 'navigation' },
  { keys: ['Ctrl', ']'], description: 'Expand sidebar', category: 'navigation' },

  // Actions
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy output', category: 'actions' },
  { keys: ['Ctrl', 'Backspace'], description: 'Clear inputs', category: 'actions' },

  // General
  { keys: ['Ctrl', '/'], description: 'Show shortcuts', category: 'general' },
  { keys: ['Esc'], description: 'Clear / unfocus', category: 'general' },
];
