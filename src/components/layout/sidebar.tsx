import { BookOpen, ChevronLeft, ChevronRight, Pin, Search, Sparkles, Tag, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { blogRegistry } from '@/blog';
import { UserMenu, UserMenuCompact } from '@/components/layout/user-menu';
import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/types/plugin';

export function Sidebar() {
  const {
    searchQuery,
    setSearchQuery,
    sidebarCollapsed,
    toggleSidebar,
    setMobileSidebarOpen,
    pinnedToolIds,
    togglePinTool,
    activeSection,
    selectedToolId,
  } = useToolStore();

  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Auto-detect section from URL
  const effectiveSection = useMemo(() => {
    if (location.pathname.startsWith('/blog')) {
      return 'blog';
    }
    return activeSection === 'blog' && !location.pathname.startsWith('/blog')
      ? 'tools'
      : activeSection;
  }, [location.pathname, activeSection]);

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

  // Get blog posts and tags for blog section
  const allBlogPosts = useMemo(() => blogRegistry.getPublished(), []);
  const blogTags = useMemo(() => blogRegistry.getAllTags(), []);

  // Filter blog posts by search query
  const filteredBlogPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return allBlogPosts;
    }
    const query = searchQuery.toLowerCase().trim();
    return allBlogPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [allBlogPosts, searchQuery]);

  // Scroll to selected tool when it changes
  useEffect(() => {
    if (!selectedToolId || !navRef.current) return;

    // Find the active link element
    const activeLink = navRef.current.querySelector(`[data-tool-id="${selectedToolId}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedToolId]);

  if (sidebarCollapsed) {
    return (
      <aside className="bg-ctp-mantle border-ctp-surface0 hidden h-full w-16 flex-col border-r lg:flex">
        {/* Logo */}
        <div className="border-ctp-surface0 flex h-14 items-center justify-center border-b">
          <Link
            to="/"
            className="bg-ctp-blue/20 text-ctp-blue flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg shadow-sm transition-transform hover:scale-105"
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
                        ? 'bg-ctp-blue/20 text-ctp-blue shadow-md'
                        : 'text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text'
                    }`
                  }
                  aria-label={plugin.label}
                >
                  {plugin.icon}
                </NavLink>
                {/* Tooltip */}
                <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="bg-ctp-crust text-ctp-text rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg">
                    {plugin.label}
                    <div className="border-r-ctp-crust absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-ctp-surface0 border-t p-2">
          <div className="flex flex-col items-center gap-2">
            <UserMenuCompact />
            <button
              onClick={toggleSidebar}
              className="text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text flex h-10 w-full cursor-pointer items-center justify-center rounded-lg transition-colors"
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
    <aside className="bg-ctp-mantle border-ctp-surface0 flex h-full w-72 flex-col border-r">
      {/* Header */}
      <div className="border-ctp-surface0 flex h-14 items-center justify-between border-b px-4">
        <Link
          to="/"
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="bg-ctp-blue/20 text-ctp-blue flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-ctp-text text-base font-semibold tracking-tight">Friendly Toolbox</h1>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => {
            setMobileSidebarOpen(false);
          }}
          className="text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text rounded-lg p-2 transition-colors lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="text-ctp-overlay0 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder={effectiveSection === 'tools' ? 'Search tools...' : 'Search posts...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="bg-ctp-base border-ctp-surface1 text-ctp-text placeholder-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue\/10 w-full rounded-xl border py-2.5 pr-16 pl-10 text-sm shadow-sm transition-all focus:ring-4 focus:outline-none"
          />
          <kbd className="bg-ctp-surface0 border-ctp-surface1 text-ctp-subtext0 absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium select-none sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Navigation Content */}
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 pb-3">
        {effectiveSection === 'blog' ? (
          // Blog section navigation
          <div className="space-y-6">
            {/* All Posts Link */}
            <div>
              <NavLink
                to="/blog"
                end
                onClick={() => {
                  setMobileSidebarOpen(false);
                }}
                className={({ isActive }) =>
                  `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? 'bg-[var(--ctp-blue)]/20 text-[var(--ctp-blue)]'
                      : 'text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50'
                  }`
                }
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">All Posts</span>
                <span className="ml-auto rounded-full bg-[var(--ctp-surface0)] px-2 py-0.5 text-xs text-[var(--ctp-subtext1)]">
                  {allBlogPosts.length}
                </span>
              </NavLink>
            </div>

            {/* Search Results or Default Navigation */}
            {searchQuery.trim() ? (
              // Show search results
              <div>
                <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-[var(--ctp-mauve)] uppercase">
                  <span>Search Results</span>
                  <span className="h-px flex-1 bg-[var(--ctp-surface0)]" />
                </h2>
                {filteredBlogPosts.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-[var(--ctp-overlay0)]">
                    No posts found
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {filteredBlogPosts.map((post) => (
                      <NavLink
                        key={post.slug}
                        to={`/blog/${post.slug}`}
                        onClick={() => {
                          setMobileSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                          `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                            isActive
                              ? 'bg-[var(--ctp-mauve)]/20 text-[var(--ctp-mauve)]'
                              : 'text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50'
                          }`
                        }
                        title={post.description}
                      >
                        <span className="truncate font-medium">{post.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Show default navigation (tags + recent posts)
              <>
                {/* Tags Section */}
                {blogTags.length > 0 && (
                  <div>
                    <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-[var(--ctp-pink)] uppercase">
                      <Tag className="h-3 w-3" />
                      <span>Tags</span>
                      <span className="h-px flex-1 bg-[var(--ctp-surface0)]" />
                    </h2>
                    <div className="space-y-0.5">
                      {blogTags.map((tag) => (
                        <NavLink
                          key={tag}
                          to={`/blog/tag/${tag}`}
                          onClick={() => {
                            setMobileSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                              isActive
                                ? 'bg-[var(--ctp-pink)]/20 text-[var(--ctp-pink)]'
                                : 'text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50'
                            }`
                          }
                        >
                          <span className="truncate font-medium">#{tag}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Posts */}
                {allBlogPosts.length > 0 && (
                  <div>
                    <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-[var(--ctp-sapphire)] uppercase">
                      <span>Recent Posts</span>
                      <span className="h-px flex-1 bg-[var(--ctp-surface0)]" />
                    </h2>
                    <div className="space-y-0.5">
                      {allBlogPosts.slice(0, 5).map((post) => (
                        <NavLink
                          key={post.slug}
                          to={`/blog/${post.slug}`}
                          onClick={() => {
                            setMobileSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                              isActive
                                ? 'bg-[var(--ctp-sapphire)]/20 text-[var(--ctp-sapphire)]'
                                : 'text-[var(--ctp-text)] hover:bg-[var(--ctp-surface0)]/50'
                            }`
                          }
                          title={post.description}
                        >
                          <span className="truncate font-medium">{post.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {allBlogPosts.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-[var(--ctp-overlay0)]">
                    No blog posts yet
                  </p>
                )}
              </>
            )}
          </div>
        ) : filteredPlugins ? (
          // Search results
          <div className="space-y-1">
            {filteredPlugins.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-[var(--ctp-overlay0)]">
                No tools found
              </p>
            ) : (
              filteredPlugins.map((plugin) => {
                const searchColors = CATEGORY_COLORS[plugin.category];
                return (
                  <NavLink
                    key={plugin.id}
                    to={`/${plugin.id}`}
                    data-tool-id={plugin.id}
                    onClick={() => {
                      setMobileSidebarOpen(false);
                    }}
                    className={({ isActive }) =>
                      `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                        isActive
                          ? `${searchColors.active} ${searchColors.text}`
                          : 'text-[var(--ctp-subtext0)] hover:bg-[var(--ctp-surface0)]/50 hover:text-[var(--ctp-text)]'
                      }`
                    }
                    title={plugin.description}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? searchColors.text
                              : `${searchColors.text} opacity-60 group-hover:opacity-100`
                          }`}
                        >
                          {plugin.icon}
                        </span>
                        <span className="truncate font-medium">{plugin.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })
            )}
          </div>
        ) : (
          // Grouped by category with pinned section
          <div className="space-y-6">
            {/* Pinned Section */}
            {pinnedPlugins.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider text-[var(--ctp-overlay1)] uppercase">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                  <span className="h-px flex-1 bg-[var(--ctp-surface0)]" />
                </h2>
                <div className="space-y-0.5">
                  {pinnedPlugins.map((plugin) => {
                    const pinnedColors = CATEGORY_COLORS[plugin.category];
                    return (
                      <div key={plugin.id} className="group/item relative">
                        <NavLink
                          to={`/${plugin.id}`}
                          data-tool-id={plugin.id}
                          onClick={() => {
                            setMobileSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                              isActive
                                ? `${pinnedColors.active} ${pinnedColors.text}`
                                : 'text-[var(--ctp-subtext0)] hover:bg-[var(--ctp-surface0)]/50 hover:text-[var(--ctp-text)]'
                            }`
                          }
                          title={plugin.description}
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`flex-shrink-0 transition-colors ${
                                  isActive
                                    ? pinnedColors.text
                                    : `${pinnedColors.text} opacity-60 group-hover:opacity-100`
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
                          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 text-[var(--ctp-yellow)] opacity-0 transition-opacity group-hover/item:opacity-100 hover:bg-[var(--ctp-surface0)]"
                          aria-label="Unpin tool"
                        >
                          <Pin className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategories.map((category) => {
              const colors = CATEGORY_COLORS[category];
              return (
                <div key={category}>
                  <h2 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-wider uppercase">
                    <span className={colors.text}>{CATEGORY_LABELS[category]}</span>
                    <span className="h-px flex-1 bg-[var(--ctp-surface0)]" />
                  </h2>
                  <div className="space-y-0.5">
                    {groupedPlugins[category]?.map((plugin) => (
                      <div key={plugin.id} className="group/item relative">
                        <NavLink
                          to={`/${plugin.id}`}
                          data-tool-id={plugin.id}
                          onClick={() => {
                            setMobileSidebarOpen(false);
                          }}
                          className={({ isActive }) =>
                            `group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                              isActive
                                ? `${colors.active} ${colors.text}`
                                : 'text-[var(--ctp-subtext0)] hover:bg-[var(--ctp-surface0)]/50 hover:text-[var(--ctp-text)]'
                            }`
                          }
                          title={plugin.description}
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`flex-shrink-0 transition-colors ${
                                  isActive
                                    ? colors.text
                                    : `${colors.text} opacity-60 group-hover:opacity-100`
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
                          className={`absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 transition-opacity hover:bg-[var(--ctp-surface0)] ${
                            pinnedToolIds.includes(plugin.id)
                              ? 'text-[var(--ctp-yellow)] opacity-100'
                              : 'text-[var(--ctp-overlay0)] opacity-0 group-hover/item:opacity-100'
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
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-ctp-surface0 space-y-3 border-t p-3">
        <UserMenu />
        <div className="bg-ctp-surface0 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-ctp-subtext0 text-xs font-medium">
              {effectiveSection === 'blog'
                ? `${String(allBlogPosts.length)} posts`
                : `${String(registry.count)} tools available`}
            </span>
            {/* Desktop collapse button */}
            <button
              onClick={toggleSidebar}
              className="text-ctp-subtext0 hover:bg-ctp-surface1 hover:text-ctp-text hidden cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors lg:flex"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </button>
          </div>
          {/* Build info */}
          <div className="text-ctp-overlay0 mt-1.5 flex items-center gap-2 text-[10px]">
            <span title={`Built: ${__BUILD_TIME__}`}>{__GIT_HASH__}</span>
            <span>•</span>
            <span>{__BUILD_ENV__}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
