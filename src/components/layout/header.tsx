import { BookOpen, ChevronDown, Menu, Monitor, Moon, Sun, Wrench } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useToolStore } from '@/store/tool-store';

interface HeaderProps {
  onShowShortcuts?: () => void; // Keep for potential future use
}

const themeOptions = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

export function Header({ onShowShortcuts: _onShowShortcuts }: HeaderProps) {
  const { theme, setTheme, selectedTool, setMobileSidebarOpen, activeSection, setActiveSection } =
    useToolStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Auto-detect section from URL
  const effectiveSection = useMemo(() => {
    if (location.pathname.startsWith('/blog')) {
      return 'blog';
    }
    return activeSection === 'blog' && !location.pathname.startsWith('/blog')
      ? 'tools'
      : activeSection;
  }, [location.pathname, activeSection]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentTheme = themeOptions.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon ?? Sun;

  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-100 px-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => {
            setMobileSidebarOpen(true);
          }}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Section Toggle */}
        <div className="flex rounded-lg bg-slate-200/50 p-1 dark:bg-slate-800/50">
          <Link
            to="/"
            onClick={() => {
              setActiveSection('tools');
            }}
            aria-label="Tools"
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              effectiveSection === 'tools'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tools</span>
          </Link>
          <Link
            to="/blog"
            onClick={() => {
              setActiveSection('blog');
            }}
            aria-label="Blog"
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              effectiveSection === 'blog'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
        </div>

        {/* Tool/Blog info */}
        {effectiveSection === 'tools' && selectedTool && (
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-slate-400">{selectedTool.icon}</span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedTool.label}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedTool.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-slate-200/50 bg-white/50 px-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 hover:shadow dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Select theme"
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentTheme?.label ?? 'Light'}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-track="theme-change"
                    onClick={() => {
                      setTheme(option.value);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
