import { useMemo } from 'react';

import { matchesToRanges, type HighlightRange, type RegexMatch } from '@/types/highlight';

export interface RegexFlags {
  global?: boolean;
  caseInsensitive?: boolean;
  multiline?: boolean;
  dotAll?: boolean;
  unicode?: boolean;
  sticky?: boolean;
}

interface UseRegexResult {
  /** Parsed RegExp object (null if invalid) */
  regex: RegExp | null;
  /** All matches found in text */
  matches: RegexMatch[];
  /** Highlight ranges for use with HighlightedTextarea */
  ranges: HighlightRange[];
  /** Error message if pattern is invalid */
  error: string | null;
  /** Flag string representation (e.g., "gim") */
  flagString: string;
}

/**
 * Build flag string from flag options
 */
export const buildFlagString = (flags: RegexFlags): string => {
  let str = '';
  if (flags.global !== false) str += 'g'; // global by default
  if (flags.caseInsensitive) str += 'i';
  if (flags.multiline) str += 'm';
  if (flags.dotAll) str += 's';
  if (flags.unicode) str += 'u';
  if (flags.sticky) str += 'y';
  return str;
};

/**
 * Parse regex pattern safely
 */
const parseRegex = (pattern: string, flags: string): RegExp | null => {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
};

/**
 * Get all matches with capture groups
 */
const getMatches = (regex: RegExp, text: string): RegexMatch[] => {
  const matches: RegexMatch[] = [];

  // Ensure global flag for iteration
  const globalRegex = new RegExp(
    regex.source,
    regex.flags.includes('g') ? regex.flags : `${regex.flags}g`
  );

  let result;
  while ((result = globalRegex.exec(text)) !== null) {
    matches.push({
      match: result[0],
      index: result.index,
      groups: result.slice(1),
    });

    // Prevent infinite loop for zero-length matches
    if (result[0].length === 0) {
      globalRegex.lastIndex++;
    }
  }

  return matches;
};

/**
 * Hook for regex pattern matching with memoized results
 *
 * @example
 * ```tsx
 * const { matches, ranges, error } = useRegex(pattern, text, {
 *   caseInsensitive: true,
 *   multiline: true,
 * });
 *
 * return (
 *   <HighlightedTextarea value={text} ranges={ranges} onChange={setText} />
 * );
 * ```
 */
export function useRegex(pattern: string, text: string, flags: RegexFlags = {}): UseRegexResult {
  const flagString = useMemo(() => buildFlagString(flags), [flags]);

  return useMemo(() => {
    // Empty pattern - no matches, no error
    if (!pattern.trim()) {
      return {
        regex: null,
        matches: [],
        ranges: [],
        error: null,
        flagString,
      };
    }

    // Try to parse the pattern
    const regex = parseRegex(pattern, flagString);
    if (!regex) {
      return {
        regex: null,
        matches: [],
        ranges: [],
        error: 'Invalid regular expression',
        flagString,
      };
    }

    // Get matches and convert to ranges
    const matches = text ? getMatches(regex, text) : [];
    const ranges = matchesToRanges(matches);

    return {
      regex,
      matches,
      ranges,
      error: null,
      flagString,
    };
  }, [pattern, text, flagString]);
}
