/**
 * Generic highlight range - can be used for regex matches, search results, etc.
 */
export interface HighlightRange {
  /** Start index in the text */
  start: number;
  /** End index in the text (exclusive) */
  end: number;
  /** Optional group index for color cycling */
  group?: number;
  /** Optional custom class name override */
  className?: string;
}

/**
 * Regex match result with capture groups
 */
export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

/**
 * Convert regex matches to highlight ranges
 */
export const matchesToRanges = (matches: RegexMatch[]): HighlightRange[] =>
  matches.map((m, i) => ({
    start: m.index,
    end: m.index + m.match.length,
    group: i,
  }));
