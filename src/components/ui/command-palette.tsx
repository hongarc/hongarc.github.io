import { Clock, Pin, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import type { ToolPlugin } from '@/types/plugin';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResultSection {
  label: string;
  icon: React.ReactNode;
  tools: ToolPlugin[];
}

interface ToolItemProps {
  tool: ToolPlugin;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (index: number) => void;
}

function ToolItem({ tool, index, isSelected, onSelect, onHover }: ToolItemProps) {
  return (
    <button
      type="button"
      data-track="palette-select"
      onClick={() => {
        onSelect(tool.id);
      }}
      onMouseEnter={() => {
        onHover(index);
      }}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
      }`}
    >
      <span
        className={`flex-shrink-0 ${
          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        {tool.icon}
      </span>
      <div className="flex-1 overflow-hidden">
        <div className="truncate font-medium">{tool.label}</div>
        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
          {tool.description}
        </div>
      </div>
      {isSelected && (
        <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline dark:bg-slate-600 dark:text-slate-400">
          ↵
        </kbd>
      )}
    </button>
  );
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { setMobileSidebarOpen, recentToolIds, pinnedToolIds } = useToolStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevIsOpen = useRef(isOpen);

  // Get sectioned results
  const { sections, flatResults } = useMemo(() => {
    const allTools = registry.getAll();

    if (query.trim()) {
      // When searching, just show filtered results
      const filtered = registry.search(query);
      return {
        sections: [] as ResultSection[],
        flatResults: filtered,
      };
    }

    // When not searching, show pinned and recent sections
    const resultSections: ResultSection[] = [];
    const shownIds = new Set<string>();

    // Pinned tools
    const pinnedTools = pinnedToolIds
      .map((id) => allTools.find((t) => t.id === id))
      .filter((t): t is ToolPlugin => t !== undefined);

    if (pinnedTools.length > 0) {
      resultSections.push({
        label: 'Pinned',
        icon: <Pin className="h-3 w-3" />,
        tools: pinnedTools,
      });
      for (const t of pinnedTools) shownIds.add(t.id);
    }

    // Recent tools (exclude already shown pinned)
    const recentTools = recentToolIds
      .filter((id) => !shownIds.has(id))
      .map((id) => allTools.find((t) => t.id === id))
      .filter((t): t is ToolPlugin => t !== undefined);

    if (recentTools.length > 0) {
      resultSections.push({
        label: 'Recent',
        icon: <Clock className="h-3 w-3" />,
        tools: recentTools,
      });
      for (const t of recentTools) shownIds.add(t.id);
    }

    // All tools (exclude already shown)
    const otherTools = allTools.filter((t) => !shownIds.has(t.id));

    // Flatten for keyboard navigation
    const flat = [...pinnedTools, ...recentTools, ...otherTools];

    return {
      sections: resultSections,
      flatResults: flat,
    };
  }, [query, recentToolIds, pinnedToolIds]);

  // Compute selected index based on results length
  const safeSelectedIndex = useMemo(() => {
    if (flatResults.length === 0) return 0;
    return Math.min(selectedIndex, flatResults.length - 1);
  }, [selectedIndex, flatResults.length]);

  // Reset state when opening (using ref to track previous state)
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // Just opened - reset via setTimeout to avoid sync setState in effect
      setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[safeSelectedIndex] as HTMLElement | undefined;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [safeSelectedIndex]);

  const handleSelect = useCallback(
    (toolId: string) => {
      void navigate(`/${toolId}`);
      setMobileSidebarOpen(false);
      onClose();
    },
    [navigate, setMobileSidebarOpen, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (flatResults[safeSelectedIndex]) {
            handleSelect(flatResults[safeSelectedIndex].id);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onClose();
          break;
        }
      }
    },
    [flatResults, safeSelectedIndex, handleSelect, onClose]
  );

  // Reset selected index when query changes
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="button"
        tabIndex={0}
        aria-label="Close command palette"
      />

      {/* Modal */}
      <div
        className="relative mx-4 w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="h-14 flex-1 bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
          />
          <kbd className="hidden rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-500 sm:inline dark:bg-slate-700 dark:text-slate-400">
            esc
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No tools found
            </div>
          ) : query.trim() ? (
            // Search results - flat list
            flatResults.map((tool, index) => (
              <ToolItem
                key={tool.id}
                tool={tool}
                index={index}
                isSelected={index === safeSelectedIndex}
                onSelect={handleSelect}
                onHover={setSelectedIndex}
              />
            ))
          ) : (
            // Sections view
            <>
              {sections.map((section) => (
                <div key={section.label} className="mb-2">
                  <div className="mb-1 flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    {section.icon}
                    <span>{section.label}</span>
                  </div>
                  {section.tools.map((tool) => {
                    const globalIndex = flatResults.findIndex((t) => t.id === tool.id);
                    return (
                      <ToolItem
                        key={tool.id}
                        tool={tool}
                        index={globalIndex}
                        isSelected={globalIndex === safeSelectedIndex}
                        onSelect={handleSelect}
                        onHover={setSelectedIndex}
                      />
                    );
                  })}
                </div>
              ))}
              {/* All Tools section */}
              <div>
                <div className="mb-1 flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  <Search className="h-3 w-3" />
                  <span>All Tools</span>
                </div>
                {flatResults
                  .filter((t) => !pinnedToolIds.includes(t.id) && !recentToolIds.includes(t.id))
                  .map((tool) => {
                    const globalIndex = flatResults.findIndex((ft) => ft.id === tool.id);
                    return (
                      <ToolItem
                        key={tool.id}
                        tool={tool}
                        index={globalIndex}
                        isSelected={globalIndex === safeSelectedIndex}
                        onSelect={handleSelect}
                        onHover={setSelectedIndex}
                      />
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-700">
                ↑
              </kbd>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-700">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-700">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>{flatResults.length} tools</span>
        </div>
      </div>
    </div>
  );
}
