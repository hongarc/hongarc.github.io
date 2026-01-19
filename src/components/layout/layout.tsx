import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { CommandPalette } from '@/components/ui/command-palette';
import { ShortcutsHelp } from '@/components/ui/shortcuts-help';
import { useInteractionTracking } from '@/hooks/use-interaction-tracking';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useToolStore } from '@/store/tool-store';

import { Header } from './header';
import { Sidebar } from './sidebar';

export function Layout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useToolStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Enable automatic click tracking via data-track attributes
  useInteractionTracking();

  useKeyboardShortcuts({
    onToggleHelp: () => {
      setShowShortcuts((prev) => !prev);
    },
    onOpenPalette: () => {
      setShowPalette(true);
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => {
            setMobileSidebarOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMobileSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          onShowShortcuts={() => {
            setShowShortcuts(true);
          }}
        />
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto px-4 pt-2 pb-4 md:px-6 md:pt-3 md:pb-6 lg:px-8 lg:pt-4 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette
        isOpen={showPalette}
        onClose={() => {
          setShowPalette(false);
        }}
      />

      {/* Shortcuts help modal */}
      <ShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => {
          setShowShortcuts(false);
        }}
      />
    </div>
  );
}
