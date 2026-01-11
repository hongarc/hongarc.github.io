import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { CommandPalette } from '@/components/ui/command-palette';
import { ShortcutsHelp } from '@/components/ui/shortcuts-help';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useToolStore } from '@/store/tool-store';

import { Header } from './header';
import { Sidebar } from './sidebar';

export function Layout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useToolStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  useKeyboardShortcuts({
    onToggleHelp: () => {
      setShowShortcuts((prev) => !prev);
    },
    onOpenPalette: () => {
      setShowPalette(true);
    },
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
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
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onShowShortcuts={() => {
            setShowShortcuts(true);
          }}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
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
