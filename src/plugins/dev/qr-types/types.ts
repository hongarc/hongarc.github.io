/**
 * Base interface for all parsed QR content
 */
export interface ParsedQRBase {
  type: string;
  raw: string;
}

/**
 * QR Type Strategy interface
 * Each QR type implements this to handle parsing and rendering
 */
export interface QRTypeStrategy<T extends ParsedQRBase = ParsedQRBase> {
  /** Unique type identifier */
  type: string;

  /** Display label for the badge */
  label: string;

  /** Badge colors */
  badge: {
    bg: string;
    text: string;
  };

  /** Optional subtitle shown next to badge */
  subtitle?: string;

  /**
   * Check if this strategy can parse the content
   * Should be fast - just check prefix/format
   */
  canParse: (content: string) => boolean;

  /**
   * Parse the content into structured data
   * Only called if canParse returns true
   */
  parse: (content: string) => T | null;

  /**
   * Render the parsed data
   * Returns the info rows and optional action button
   */
  render: (parsed: T) => {
    rows: InfoRowData[];
    action?: ActionData;
    showRaw?: boolean;
  };
}

/**
 * Data for an info row
 */
export interface InfoRowData {
  label: string;
  value: string;
  copyable?: boolean;
  link?: boolean;
}

/**
 * Data for an action button
 */
export interface ActionData {
  label: string;
  href: string;
  external?: boolean;
  color: string;
}
