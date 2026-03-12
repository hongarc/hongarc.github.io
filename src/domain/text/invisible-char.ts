import {
  filter,
  groupBy,
  join,
  length,
  map,
  pipe,
  prop,
  reject,
} from 'ramda';

// ---------------------------------------------------------------------------
// Invisible character database
// ---------------------------------------------------------------------------

export interface InvisibleCharInfo {
  name: string;
  unicode: string;
  html: string;
  codePoint: number;
}

export const INVISIBLE_CHARS: InvisibleCharInfo[] = [
  { codePoint: 0x03_4f, name: 'Combining Grapheme Joiner', unicode: 'U+034F', html: '&#847;' },
  { codePoint: 0x06_1c, name: 'Arabic Letter Mark', unicode: 'U+061C', html: '&#1564;' },
  { codePoint: 0x18_0e, name: 'Mongolian Vowel Separator', unicode: 'U+180E', html: '&#6158;' },
  { codePoint: 0x20_0b, name: 'Zero Width Space', unicode: 'U+200B', html: '&#8203;' },
  { codePoint: 0x20_0c, name: 'Zero Width Non-Joiner', unicode: 'U+200C', html: '&zwnj;' },
  { codePoint: 0x20_0d, name: 'Zero Width Joiner', unicode: 'U+200D', html: '&zwj;' },
  { codePoint: 0x20_0e, name: 'Left-to-Right Mark', unicode: 'U+200E', html: '&lrm;' },
  { codePoint: 0x20_0f, name: 'Right-to-Left Mark', unicode: 'U+200F', html: '&rlm;' },
  { codePoint: 0x20_2a, name: 'Left-to-Right Embedding', unicode: 'U+202A', html: '&#8234;' },
  { codePoint: 0x20_2b, name: 'Right-to-Left Embedding', unicode: 'U+202B', html: '&#8235;' },
  { codePoint: 0x20_2c, name: 'Pop Directional Formatting', unicode: 'U+202C', html: '&#8236;' },
  { codePoint: 0x20_2d, name: 'Left-to-Right Override', unicode: 'U+202D', html: '&#8237;' },
  { codePoint: 0x20_2e, name: 'Right-to-Left Override', unicode: 'U+202E', html: '&#8238;' },
  { codePoint: 0x20_60, name: 'Word Joiner', unicode: 'U+2060', html: '&#8288;' },
  { codePoint: 0x20_61, name: 'Function Application', unicode: 'U+2061', html: '&#8289;' },
  { codePoint: 0x20_62, name: 'Invisible Times', unicode: 'U+2062', html: '&#8290;' },
  { codePoint: 0x20_63, name: 'Invisible Separator', unicode: 'U+2063', html: '&#8291;' },
  { codePoint: 0x20_64, name: 'Invisible Plus', unicode: 'U+2064', html: '&#8292;' },
  { codePoint: 0x20_66, name: 'Left-to-Right Isolate', unicode: 'U+2066', html: '&#8294;' },
  { codePoint: 0x20_67, name: 'Right-to-Left Isolate', unicode: 'U+2067', html: '&#8295;' },
  { codePoint: 0x20_68, name: 'First Strong Isolate', unicode: 'U+2068', html: '&#8296;' },
  { codePoint: 0x20_69, name: 'Pop Directional Isolate', unicode: 'U+2069', html: '&#8297;' },
  { codePoint: 0xfe_ff, name: 'BOM / Zero Width No-Break Space', unicode: 'U+FEFF', html: '&#65279;' },
  // Variation Selectors
  { codePoint: 0xfe_00, name: 'Variation Selector 1', unicode: 'U+FE00', html: '&#65024;' },
  { codePoint: 0xfe_01, name: 'Variation Selector 2', unicode: 'U+FE01', html: '&#65025;' },
  { codePoint: 0xfe_02, name: 'Variation Selector 3', unicode: 'U+FE02', html: '&#65026;' },
  { codePoint: 0xfe_03, name: 'Variation Selector 4', unicode: 'U+FE03', html: '&#65027;' },
  { codePoint: 0xfe_04, name: 'Variation Selector 5', unicode: 'U+FE04', html: '&#65028;' },
  { codePoint: 0xfe_05, name: 'Variation Selector 6', unicode: 'U+FE05', html: '&#65029;' },
  { codePoint: 0xfe_06, name: 'Variation Selector 7', unicode: 'U+FE06', html: '&#65030;' },
  { codePoint: 0xfe_07, name: 'Variation Selector 8', unicode: 'U+FE07', html: '&#65031;' },
  { codePoint: 0xfe_08, name: 'Variation Selector 9', unicode: 'U+FE08', html: '&#65032;' },
  { codePoint: 0xfe_09, name: 'Variation Selector 10', unicode: 'U+FE09', html: '&#65033;' },
  { codePoint: 0xfe_0a, name: 'Variation Selector 11', unicode: 'U+FE0A', html: '&#65034;' },
  { codePoint: 0xfe_0b, name: 'Variation Selector 12', unicode: 'U+FE0B', html: '&#65035;' },
  { codePoint: 0xfe_0c, name: 'Variation Selector 13', unicode: 'U+FE0C', html: '&#65036;' },
  { codePoint: 0xfe_0d, name: 'Variation Selector 14', unicode: 'U+FE0D', html: '&#65037;' },
  { codePoint: 0xfe_0e, name: 'Variation Selector 15', unicode: 'U+FE0E', html: '&#65038;' },
  { codePoint: 0xfe_0f, name: 'Variation Selector 16', unicode: 'U+FE0F', html: '&#65039;' },
];

// Fast lookup by code point
export const CHAR_LOOKUP = new Map(INVISIBLE_CHARS.map((c) => [c.codePoint, c]));

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

/** Split text into code-point-aware indexed chars */
interface IndexedChar {
  char: string;
  index: number;
  codePoint: number;
}

const toIndexedChars = (text: string): IndexedChar[] => {
  const chars: IndexedChar[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (cp === undefined) continue;
    chars.push({ char: text.charAt(i), index: i, codePoint: cp });
    if (cp > 0xff_ff) i++;
  }
  return chars;
};

const isInvisible = (ic: IndexedChar): boolean => CHAR_LOOKUP.has(ic.codePoint);

const lookupInfo = (ic: IndexedChar): InvisibleCharInfo =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  CHAR_LOOKUP.get(ic.codePoint)!;

// ---------------------------------------------------------------------------
// Pure analysis (Ramda pipelines)
// ---------------------------------------------------------------------------

export interface InvisibleCharFinding {
  index: number;
  char: string;
  info: InvisibleCharInfo;
}

export interface GroupedFinding {
  info: InvisibleCharInfo;
  count: number;
  positions: number[];
}

export interface AnalysisResult {
  totalChars: number;
  visibleChars: number;
  invisibleChars: number;
  findings: InvisibleCharFinding[];
  grouped: GroupedFinding[];
}

/** Extract findings from indexed chars */
const toFindings: (chars: IndexedChar[]) => InvisibleCharFinding[] = pipe(
  filter(isInvisible),
  map((ic: IndexedChar) => ({ index: ic.index, char: ic.char, info: lookupInfo(ic) })),
);

/** Group findings by code point */
const groupFindings = (findings: InvisibleCharFinding[]): GroupedFinding[] =>
  pipe(
    groupBy((f: InvisibleCharFinding) => String(f.info.codePoint)),
    Object.values,
    filter((g): g is InvisibleCharFinding[] => Array.isArray(g)),
    map((group: InvisibleCharFinding[]) => {
      const [first] = group;
      if (!first) throw new Error('Unexpected empty group');
      return {
        info: first.info,
        count: length(group),
        positions: map(prop('index'), group),
      };
    }),
  )(findings);

export function analyzeText(text: string): AnalysisResult {
  const chars = toIndexedChars(text);
  const findings = toFindings(chars);
  return {
    totalChars: text.length,
    visibleChars: text.length - findings.length,
    invisibleChars: findings.length,
    findings,
    grouped: groupFindings(findings),
  };
}

/** Remove invisible chars — keep only visible indexed chars, join back */
export const removeInvisibleChars: (text: string) => string = pipe(
  toIndexedChars,
  reject(isInvisible),
  map(prop('char')),
  join(''),
);

// ---------------------------------------------------------------------------
// Character map segments (Ramda reduce)
// ---------------------------------------------------------------------------

/** A segment is either a run of normal text or a single invisible char */
export type Segment =
  | { type: 'text'; value: string }
  | { type: 'invisible'; info: InvisibleCharInfo; index: number };

interface SegmentAccumulator {
  segments: Segment[];
  run: string;
}

const flushRun = (acc: SegmentAccumulator): SegmentAccumulator =>
  acc.run
    ? { segments: [...acc.segments, { type: 'text' as const, value: acc.run }], run: '' }
    : acc;

const segmentReducer = (acc: SegmentAccumulator, ic: IndexedChar): SegmentAccumulator => {
  const info = CHAR_LOOKUP.get(ic.codePoint);
  if (info) {
    const flushed = flushRun(acc);
    return {
      segments: [...flushed.segments, { type: 'invisible', info, index: ic.index }],
      run: '',
    };
  }
  return { ...acc, run: acc.run + ic.char };
};

export const buildSegments: (text: string) => Segment[] = pipe(
  toIndexedChars,
  (chars: IndexedChar[]) => chars.reduce((acc, ic) => segmentReducer(acc, ic), { segments: [] as Segment[], run: '' }),
  flushRun,
  prop('segments'),
);
