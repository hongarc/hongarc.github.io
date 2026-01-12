import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import { CATEGORY_ORDER } from '@/types/plugin';

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
    theme,
    setTheme,
    setActiveSection,
    pinnedToolIds,
  } = useToolStore();

  const openPalette = useCallback(() => {
    handlers.onOpenPalette?.();
  }, [handlers]);

  // Get tools in sidebar display order: pinned first, then by category
  const orderedTools = useMemo(() => {
    const allTools = registry.getAll();
    const grouped = registry.getGroupedByCategory();

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
  }, [pinnedToolIds]);

  const navigateToTool = useCallback(
    (direction: 'next' | 'prev') => {
      if (orderedTools.length === 0) return;

      const currentIndex = orderedTools.findIndex((t) => t.id === selectedToolId);
      let newIndex: number;

      if (direction === 'next') {
        newIndex = currentIndex < orderedTools.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : orderedTools.length - 1;
      }

      const newTool = orderedTools[newIndex];
      if (newTool) {
        void navigate(`/${newTool.id}`);
      }
    },
    [navigate, selectedToolId, orderedTools]
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

      // Arrow keys - Navigate tools (j/J = next, k/K = prev)
      if (event.key === 'ArrowDown' || event.key === 'j' || event.key === 'J') {
        event.preventDefault();
        navigateToTool('next');
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'k' || event.key === 'K') {
        event.preventDefault();
        navigateToTool('prev');
        return;
      }

      // / - Open command palette (vim-style)
      if (event.key === '/') {
        event.preventDefault();
        openPalette();
        return;
      }

      // D - Toggle dark mode
      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // B - Toggle sidebar
      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      // H - Go home
      if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        setActiveSection('tools');
        void navigate('/');
        return;
      }

      // T - Go to tools
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        setActiveSection('tools');
        void navigate('/');
        return;
      }

      // G - Go to blog
      if (event.key === 'g' || event.key === 'G') {
        event.preventDefault();
        setActiveSection('blog');
        void navigate('/blog');
      }
    },
    [
      openPalette,
      handlers,
      toggleSidebar,
      sidebarCollapsed,
      copyToClipboard,
      searchQuery,
      setSearchQuery,
      clearInputs,
      navigateToTool,
      theme,
      setTheme,
      setActiveSection,
      navigate,
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
  { keys: ['B'], description: 'Toggle sidebar', category: 'navigation' },
  { keys: ['Ctrl', '['], description: 'Collapse sidebar', category: 'navigation' },
  { keys: ['Ctrl', ']'], description: 'Expand sidebar', category: 'navigation' },
  { keys: ['H'], description: 'Go home', category: 'navigation' },
  { keys: ['G'], description: 'Go to blog', category: 'navigation' },

  // Actions
  { keys: ['D'], description: 'Toggle dark mode', category: 'actions' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy output', category: 'actions' },
  { keys: ['Ctrl', 'Backspace'], description: 'Clear inputs', category: 'actions' },

  // General
  { keys: ['Ctrl', '/'], description: 'Show shortcuts', category: 'general' },
  { keys: ['Esc'], description: 'Clear / unfocus', category: 'general' },
];
