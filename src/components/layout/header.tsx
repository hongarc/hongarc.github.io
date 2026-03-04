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
    <header className="border-ctp-surface0 bg-ctp-mantle relative z-10 flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => {
            setMobileSidebarOpen(true);
          }}
          className="text-ctp-overlay0 hover:bg-ctp-surface0 hover:text-ctp-text rounded-lg p-2 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Section Toggle */}
        <div className="bg-ctp-surface0 flex rounded-lg p-1">
          <Link
            to="/"
            onClick={() => {
              setActiveSection('tools');
            }}
            aria-label="Tools"
            className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              effectiveSection === 'tools'
                ? 'bg-ctp-base text-ctp-text shadow-sm'
                : 'text-ctp-overlay0 hover:text-ctp-text'
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
                ? 'bg-ctp-base text-ctp-text shadow-sm'
                : 'text-ctp-overlay0 hover:text-ctp-text'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
        </div>

        {/* Tool/Blog info */}
        {effectiveSection === 'tools' && selectedTool && (
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-ctp-overlay0">{selectedTool.icon}</span>
            <div>
              <h2 className="text-ctp-text text-sm font-semibold">
                {selectedTool.label}
              </h2>
              <p className="text-ctp-overlay0 text-xs">
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
            className="border-ctp-surface1 bg-ctp-base text-ctp-subtext1 hover:text-ctp-text flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition-all hover:shadow"
            aria-label="Select theme"
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentTheme?.label ?? 'Light'}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="border-ctp-surface1 bg-ctp-base absolute top-full right-0 z-50 mt-1 w-36 overflow-hidden rounded-lg border shadow-lg">
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
                        ? 'bg-ctp-blue/10 text-ctp-blue'
                        : 'text-ctp-text hover:bg-ctp-surface0'
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
