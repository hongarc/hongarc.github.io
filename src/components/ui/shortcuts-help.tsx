import { Keyboard, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { SHORTCUTS, type ShortcutDef } from '@/hooks/use-keyboard-shortcuts';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutKey({ keyName }: { keyName: string }) {
  // Replace Ctrl with Cmd on Mac
  const isMac = /mac/i.test(globalThis.navigator.userAgent);
  const displayKey = keyName === 'Ctrl' && isMac ? '\u2318' : keyName;

  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-slate-100 px-1.5 font-mono text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
      {displayKey}
    </kbd>
  );
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutDef }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-600 dark:text-slate-400">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, i) => (
          <ShortcutKey key={`${shortcut.description}-${String(i)}`} keyName={key} />
        ))}
      </div>
    </div>
  );
}

interface GroupedShortcuts {
  navigation: ShortcutDef[];
  actions: ShortcutDef[];
  general: ShortcutDef[];
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const grouped = useMemo((): GroupedShortcuts => {
    const groups: GroupedShortcuts = {
      navigation: [],
      actions: [],
      general: [],
    };
    for (const shortcut of SHORTCUTS) {
      groups[shortcut.category].push(shortcut);
    }
    return groups;
  }, []);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    globalThis.addEventListener('keydown', handleEscape);
    return () => {
      globalThis.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close shortcuts help"
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="space-y-4">
          {/* Navigation */}
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Navigation
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {grouped.navigation.map((s) => (
                <ShortcutRow key={s.description} shortcut={s} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Actions
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {grouped.actions.map((s) => (
                <ShortcutRow key={s.description} shortcut={s} />
              ))}
            </div>
          </div>

          {/* General */}
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              General
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {grouped.general.map((s) => (
                <ShortcutRow key={s.description} shortcut={s} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <span>Press</span>
          <ShortcutKey keyName="Esc" />
          <span>to close</span>
        </div>
      </div>
    </div>
  );
}
