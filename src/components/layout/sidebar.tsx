import { ChevronLeft, ChevronRight, Pin, Search, Sparkles, X } from 'lucide-react';
import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { UserMenu, UserMenuCompact } from '@/components/layout/user-menu';
import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/plugin';

export function Sidebar() {
  const {
    searchQuery,
    setSearchQuery,
    sidebarCollapsed,
    toggleSidebar,
    setMobileSidebarOpen,
    pinnedToolIds,
    togglePinTool,
  } = useToolStore();

  const filteredPlugins = useMemo(() => {
    if (searchQuery.trim()) {
      return registry.search(searchQuery);
    }
    return null;
  }, [searchQuery]);

  const groupedPlugins = useMemo(() => {
    return registry.getGroupedByCategory();
  }, []);

  const activeCategories = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => groupedPlugins[cat] && groupedPlugins[cat].length > 0);
  }, [groupedPlugins]);

  // Get all plugins for collapsed view
  const allPlugins = useMemo(() => {
    return registry.getAll();
  }, []);

  // Get pinned plugins
  const pinnedPlugins = useMemo(() => {
    return pinnedToolIds
      .map((id) => allPlugins.find((p) => p.id === id))
      .filter((p) => p !== undefined);
  }, [pinnedToolIds, allPlugins]);

  if (sidebarCollapsed) {
    return (
      <aside className="hidden h-full w-16 flex-col border-r border-slate-200 bg-slate-100 lg:flex dark:border-slate-800 dark:bg-slate-950">
        {/* Logo */}
        <div className="flex h-14 items-center justify-center border-b border-slate-200/80 dark:border-slate-700/50">
          <Link
            to="/"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/25 transition-transform hover:scale-105"
            aria-label="Home"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>

        {/* Tool Icons */}
        <nav className="flex-1 overflow-x-hidden overflow-y-auto py-2">
          <div className="flex flex-col items-center gap-1">
            {allPlugins.map((plugin) => (
              <div key={plugin.id} className="group relative">
                <NavLink
                  to={`/${plugin.id}`}
                  onClick={() => {
                    setMobileSidebarOpen(false);
                  }}
                  className={({ isActive }) =>
                    `flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`
                  }
                  aria-label={plugin.label}
                >
                  {plugin.icon}
                </NavLink>
                {/* Tooltip */}
                <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-slate-700">
                    {plugin.label}
                    <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/80 p-2 dark:border-slate-700/50">
          <div className="flex flex-col items-center gap-2">
            <UserMenuCompact />
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-700/50">
        <Link
          to="/"
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/25">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Friendly Toolbox
          </h1>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => {
            setMobileSidebarOpen(false);
          }}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full rounded-xl border border-slate-200/50 bg-white/50 py-2.5 pr-16 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-sm transition-all focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500/50 dark:focus:bg-slate-800/80"
          />
          <kbd className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 select-none sm:flex dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Tool List */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredPlugins ? (
          // Search results
          <div className="space-y-1">
            {filteredPlugins.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No tools found
              </p>
            ) : (
              filteredPlugins.map((plugin) => (
                <NavLink
                  key={plugin.id}
                  to={`/${plugin.id}`}
                  onClick={() => {
                    setMobileSidebarOpen(false);
                  }}
                  className={({ isActive }) =>
                    `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                    }`
                  }
                  title={plugin.description}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                        }`}
                      >
                        {plugin.icon}
                      </span>
                      <span className="truncate font-medium">{plugin.label}</span>
                    </>
                  )}
                </NavLink>
              ))
            )}
          </div>
        ) : (
          // Grouped by category with pinned section
          <div className="space-y-6">
            {/* Pinned Section */}
            {pinnedPlugins.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
                </h2>
                <div className="space-y-0.5">
                  {pinnedPlugins.map((plugin) => (
                    <div key={plugin.id} className="group/item relative">
                      <NavLink
                        to={`/${plugin.id}`}
                        onClick={() => {
                          setMobileSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 dark:from-blue-600 dark:to-blue-500 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                          }`
                        }
                        title={plugin.description}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`flex-shrink-0 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                              }`}
                            >
                              {plugin.icon}
                            </span>
                            <span className="flex-1 truncate font-medium">{plugin.label}</span>
                          </>
                        )}
                      </NavLink>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePinTool(plugin.id);
                        }}
                        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 text-amber-500 opacity-0 transition-opacity group-hover/item:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Unpin tool"
                      >
                        <Pin className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeCategories.map((category) => (
              <div key={category}>
                <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  <span>{CATEGORY_LABELS[category]}</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
                </h2>
                <div className="space-y-0.5">
                  {groupedPlugins[category]?.map((plugin) => (
                    <div key={plugin.id} className="group/item relative">
                      <NavLink
                        to={`/${plugin.id}`}
                        onClick={() => {
                          setMobileSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 dark:from-blue-600 dark:to-blue-500 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                          }`
                        }
                        title={plugin.description}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`flex-shrink-0 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                              }`}
                            >
                              {plugin.icon}
                            </span>
                            <span className="flex-1 truncate font-medium">{plugin.label}</span>
                          </>
                        )}
                      </NavLink>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePinTool(plugin.id);
                        }}
                        className={`absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-700 ${
                          pinnedToolIds.includes(plugin.id)
                            ? 'text-amber-500 opacity-100'
                            : 'text-slate-400 opacity-0 group-hover/item:opacity-100'
                        }`}
                        aria-label={pinnedToolIds.includes(plugin.id) ? 'Unpin tool' : 'Pin tool'}
                      >
                        <Pin
                          className={`h-3.5 w-3.5 ${pinnedToolIds.includes(plugin.id) ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-slate-200/80 p-3 dark:border-slate-700/50">
        <UserMenu />
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {registry.count} tools available
            </span>
            {/* Desktop collapse button */}
            <button
              onClick={toggleSidebar}
              className="hidden cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 lg:flex dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </button>
          </div>
          {/* Build info */}
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
            <span title={`Built: ${__BUILD_TIME__}`}>{__GIT_HASH__}</span>
            <span>•</span>
            <span>{__BUILD_ENV__}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
