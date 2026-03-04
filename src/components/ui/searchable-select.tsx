import { ChevronDown, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  required,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find selected option label
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filter options based on search and reset highlight
  const filteredOptions = useMemo(() => {
    const result = search
      ? options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase()) ||
            opt.value.toLowerCase().includes(search.toLowerCase())
        )
      : options;
    // Note: highlightedIndex is reset in the search onChange handler instead
    return result;
  }, [options, search]);

  // Reset highlight when search changes
  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setHighlightedIndex(0);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLLIElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearch('');
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setIsOpen(false);
          setSearch('');
          break;
        }
      }
    },
    [isOpen, filteredOptions, highlightedIndex, handleSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearch('');
    },
    [onChange]
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        tabIndex={0}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        onKeyDown={handleKeyDown}
        className="border-ctp-surface1 bg-ctp-mantle text-ctp-text flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:border-ctp-blue focus:ring-2 focus:ring-ctp-blue/10 focus:outline-none"
      >
        <span className={selectedOption ? '' : 'text-ctp-overlay0'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !required && (
            <button
              type="button"
              onClick={handleClear}
              className="text-ctp-overlay0 hover:bg-ctp-surface0 hover:text-ctp-subtext1 rounded p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`text-ctp-overlay0 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="border-ctp-surface1 bg-ctp-base absolute z-50 mt-1 w-full rounded-lg border shadow-lg">
          {/* Search Input */}
          <div className="border-ctp-surface1 border-b p-2">
            <div className="relative">
              <Search className="text-ctp-overlay0 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="border-ctp-surface1 bg-ctp-mantle text-ctp-text placeholder-ctp-overlay0 w-full rounded-md border py-1.5 pr-3 pl-8 text-sm focus:border-ctp-blue focus:ring-1 focus:ring-ctp-blue/10 focus:outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            className="max-h-60 overflow-y-auto p-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="text-ctp-overlay0 px-3 py-2 text-sm">
                No results found
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    handleSelect(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                  onMouseEnter={() => {
                    setHighlightedIndex(index);
                  }}
                  tabIndex={-1}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
                    index === highlightedIndex
                      ? 'bg-ctp-blue/10 text-ctp-blue'
                      : option.value === value
                        ? 'bg-ctp-surface0'
                        : 'text-ctp-text hover:bg-ctp-surface0'
                  }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
