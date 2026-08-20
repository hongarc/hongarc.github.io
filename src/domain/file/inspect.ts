/**
 * Facts about a file beyond its type: how big it is, what its bytes look like,
 * whether the name agrees with the content, and whether an upload rule would
 * let it through.
 *
 * Pure functions over a `Uint8Array` head slice plus plain metadata, so the
 * whole module is unit-testable without the File API.
 */

import { filter, join, map, pipe, split } from 'remeda';

import type { DetectedType, TypeFamily } from './signature';
import { decodeUtf8, familyOfMimetype, mimetypeOfExtension, startsWithBytes } from './signature';

const KIB = 1024;

/** Bytes read from the front of a file — enough for headers and a text sample. */
export const HEAD_BYTES = 65_536;

/** Human-readable byte count, from bytes up to gigabytes. */
export const formatByteSize = (bytes: number): string => {
  if (bytes < KIB) return `${String(bytes)} B`;
  if (bytes < KIB * KIB) return `${(bytes / KIB).toFixed(1)} KB`;
  if (bytes < KIB * KIB * KIB) return `${(bytes / (KIB * KIB)).toFixed(1)} MB`;
  return `${(bytes / (KIB * KIB * KIB)).toFixed(2)} GB`;
};

export type TextEncodingName =
  'UTF-8, no byte order mark' | 'UTF-8 with byte order mark' | 'UTF-16LE' | 'UTF-16BE';

export interface DelimiterFacts {
  /** Delimiter name, e.g. `comma`. */
  name: string;
  /** Column count implied by the first line. */
  columns: number;
  /** Whether every sampled line has the same column count. */
  consistent: boolean;
}

export interface TextFacts {
  encoding: TextEncodingName;
  hasBom: boolean;
  lineEndings: string;
  /** Non-empty lines seen in the sampled head. */
  sampledLines: number;
  delimiter: DelimiterFacts | null;
}

const UTF8_BOM = [0xef, 0xbb, 0xbf];
const UTF16_LE_BOM = [0xff, 0xfe];
const UTF16_BE_BOM = [0xfe, 0xff];

const DELIMITERS: readonly { name: string; character: string }[] = [
  { name: 'comma', character: ',' },
  { name: 'semicolon', character: ';' },
  { name: 'tab', character: '\t' },
  { name: 'pipe', character: '|' },
];

const DELIMITER_SAMPLE_LINES = 6;

/** Decode the head as text under the encoding its byte order mark implies. */
export const decodeTextHead = (bytes: Uint8Array): string | null => {
  // TextDecoder drops a leading byte order mark itself, for every encoding
  // below — decoding is where the mark disappears, so nothing is sliced here.
  if (startsWithBytes(bytes, UTF16_LE_BOM)) return new TextDecoder('utf-16le').decode(bytes);
  if (startsWithBytes(bytes, UTF16_BE_BOM)) return new TextDecoder('utf-16be').decode(bytes);
  return decodeUtf8(bytes);
};

const detectEncoding = (bytes: Uint8Array): TextEncodingName => {
  if (startsWithBytes(bytes, UTF16_LE_BOM)) return 'UTF-16LE';
  if (startsWithBytes(bytes, UTF16_BE_BOM)) return 'UTF-16BE';
  return startsWithBytes(bytes, UTF8_BOM)
    ? 'UTF-8 with byte order mark'
    : 'UTF-8, no byte order mark';
};

const describeLineEndings = (text: string): string => {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  const lf = (text.match(/(?<!\r)\n/g) ?? []).length;
  const cr = (text.match(/\r(?!\n)/g) ?? []).length;

  const found = [
    crlf > 0 ? `${String(crlf)} CRLF` : '',
    lf > 0 ? `${String(lf)} LF` : '',
    cr > 0 ? `${String(cr)} CR` : '',
  ].filter((part) => part.length > 0);

  if (found.length === 0) return 'none in the sampled head';
  if (found.length > 1) return `mixed — ${join(found, ', ')}`;
  if (crlf > 0) return 'CRLF (Windows)';
  return lf > 0 ? 'LF (Unix)' : 'CR (classic Mac)';
};

/** Guess the delimiter by column consistency across the first few lines. */
export const detectDelimiter = (lines: readonly string[]): DelimiterFacts | null => {
  const sample = lines.slice(0, DELIMITER_SAMPLE_LINES);
  if (sample.length === 0) return null;

  const scored = DELIMITERS.map(({ name, character }) => {
    const counts = sample.map((line) => split(line, character).length - 1);
    const first = counts[0] ?? 0;
    const consistent = counts.every((count) => count === first);
    return { name, columns: first + 1, consistent, score: first * (consistent ? 2 : 1) };
  }).filter((candidate) => candidate.columns > 1);

  if (scored.length === 0) return null;

  const best = scored.reduce((winner, candidate) =>
    candidate.score > winner.score ? candidate : winner
  );
  return { name: best.name, columns: best.columns, consistent: best.consistent };
};

/** Encoding, byte order mark, line endings and delimited-data shape. */
export const readTextFacts = (bytes: Uint8Array, text: string): TextFacts => {
  const allLines: string[] = split(text, /\r?\n/);
  const lines = filter(allLines, (line) => line.length > 0);

  return {
    encoding: detectEncoding(bytes),
    hasBom:
      startsWithBytes(bytes, UTF8_BOM) ||
      startsWithBytes(bytes, UTF16_LE_BOM) ||
      startsWithBytes(bytes, UTF16_BE_BOM),
    lineEndings: describeLineEndings(text),
    sampledLines: lines.length,
    delimiter: detectDelimiter(lines),
  };
};

export interface ImageSize {
  width: number;
  height: number;
}

const readUint16 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);

const readUint32 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] ?? 0) << 24) |
  ((bytes[offset + 1] ?? 0) << 16) |
  ((bytes[offset + 2] ?? 0) << 8) |
  (bytes[offset + 3] ?? 0);

/** JPEG frame markers that carry the image dimensions. */
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const readJpegSize = (bytes: Uint8Array): ImageSize | null => {
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1] ?? 0;
    if (JPEG_SOF_MARKERS.has(marker)) {
      return { height: readUint16(bytes, offset + 5), width: readUint16(bytes, offset + 7) };
    }
    offset += 2 + readUint16(bytes, offset + 2);
  }
  return null;
};

/** Pixel dimensions for the raster formats whose header carries them. */
export const readImageSize = (bytes: Uint8Array): ImageSize | null => {
  if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
  }
  if (startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38])) {
    return {
      width: (bytes[6] ?? 0) | ((bytes[7] ?? 0) << 8),
      height: (bytes[8] ?? 0) | ((bytes[9] ?? 0) << 8),
    };
  }
  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) return readJpegSize(bytes);
  return null;
};

export type VerdictLevel = 'pass' | 'warn' | 'fail';

export interface Verdict {
  level: VerdictLevel;
  /** Short value for a badge. */
  summary: string;
  /** The reasoning, for a tooltip or a report line. */
  detail: string;
}

/** The extension of a file name, lower-cased and without the dot. */
export const extensionOf = (fileName: string): string => {
  const match = /\.([A-Za-z0-9]+)$/.exec(fileName);
  return (match?.[1] ?? '').toLowerCase();
};

/** Does the declared mimetype match what the extension implies? */
export const checkExtension = (fileName: string, declaredMimetype: string): Verdict => {
  const extension = extensionOf(fileName);
  if (extension.length === 0) {
    return {
      level: 'warn',
      summary: 'no extension',
      detail: 'The name carries no extension, so most browsers report an empty type for it.',
    };
  }

  const expected = mimetypeOfExtension(extension);
  if (expected === null) {
    return {
      level: 'warn',
      summary: `.${extension} unknown here`,
      detail: `No mimetype is mapped to .${extension} in this tool, so there is nothing to compare.`,
    };
  }
  if (declaredMimetype.length === 0) {
    return {
      level: 'warn',
      summary: 'nothing declared',
      detail: `The browser reported no type. For .${extension} it usually reports ${expected}.`,
    };
  }
  if (declaredMimetype === expected) {
    return {
      level: 'pass',
      summary: 'agrees',
      detail: `.${extension} and the declared ${expected} are the expected pair.`,
    };
  }
  return {
    level: 'warn',
    summary: `expected ${expected}`,
    detail:
      `The browser declared ${declaredMimetype}, while .${extension} normally maps to ` +
      `${expected}. Both spellings occur in the wild, so this is a note, not a failure.`,
  };
};

/** Does the declared mimetype agree with the family the bytes prove? */
export const compareDeclared = (declaredMimetype: string, detected: DetectedType): Verdict => {
  if (declaredMimetype.length === 0) {
    return {
      level: 'warn',
      summary: 'nothing declared',
      detail: `The browser reported no type, so there is nothing to check against ${detected.label}.`,
    };
  }

  const declaredFamily: TypeFamily | null = familyOfMimetype(declaredMimetype);
  if (declaredFamily === null) {
    return {
      level: 'warn',
      summary: 'declared type unknown',
      detail: `${declaredMimetype} is not a type this tool can map to a byte signature.`,
    };
  }
  if (declaredFamily === detected.family) {
    return {
      level: 'pass',
      summary: 'consistent',
      detail: `${declaredMimetype} is consistent with the bytes: ${detected.label}.`,
    };
  }
  return {
    level: 'fail',
    summary: 'mismatch',
    detail: `Declared ${declaredMimetype}, but the bytes are ${detected.label}.`,
  };
};

/** Split an allow-list input into comparable entries. */
export const parseAllowList = (raw: string): string[] =>
  pipe(
    raw,
    split(/[\s,]+/),
    map((entry: string) => entry.trim().toLowerCase()),
    filter((entry: string) => entry.length > 0)
  );

const matchesEntry = (entry: string, mimetype: string, extension: string): boolean => {
  if (entry.endsWith('/*')) return mimetype.startsWith(entry.slice(0, -1));
  if (entry.includes('/')) return entry === mimetype;
  return entry.replace(/^\./, '') === extension;
};

/**
 * Would an upload allow-list accept this file?
 * Entries may be mimetypes (`text/csv`), wildcards (`image/*`) or extensions (`.csv`).
 * Returns null when no allow-list was supplied.
 */
export const checkAllowList = (
  raw: string,
  fileName: string,
  declaredMimetype: string
): Verdict | null => {
  const entries = parseAllowList(raw);
  if (entries.length === 0) return null;

  const extension = extensionOf(fileName);
  const mimetype = declaredMimetype.toLowerCase();
  const hit = entries.find((entry) => matchesEntry(entry, mimetype, extension));

  if (hit === undefined) {
    return {
      level: 'fail',
      summary: 'not allowed',
      detail:
        `Neither the declared type (${mimetype.length > 0 ? mimetype : 'empty'}) nor the ` +
        `extension (${extension.length > 0 ? `.${extension}` : 'none'}) matches any of the ` +
        `${String(entries.length)} allowed entries.`,
    };
  }
  return {
    level: 'pass',
    summary: `allowed by ${hit}`,
    detail: `Matched the allow-list entry ${hit}. Note this matches the claim, not the bytes.`,
  };
};

/** Is the file within a maximum size? Returns null when no limit was supplied. */
export const checkSize = (size: number, maxMegabytes: number): Verdict | null => {
  if (maxMegabytes <= 0) return null;

  const limit = maxMegabytes * KIB * KIB;
  if (size > limit) {
    return {
      level: 'fail',
      summary: 'over the limit',
      detail: `${formatByteSize(size)} exceeds the ${formatByteSize(limit)} limit.`,
    };
  }
  return {
    level: 'pass',
    summary: 'within the limit',
    detail: `${formatByteSize(size)} of ${formatByteSize(limit)} allowed.`,
  };
};
