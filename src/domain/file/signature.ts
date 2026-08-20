/**
 * File type identification from magic bytes.
 *
 * Everything here works on a `Uint8Array` head slice, so it stays pure and
 * testable without the File API. The name of a file plays no part — that is the
 * whole point: a `.csv` holding a PDF is exactly what this module reveals.
 */

/** Broad content families a signature can prove. Several mimetypes share one. */
export type TypeFamily =
  'pdf' | 'ole2' | 'ooxml' | 'zip' | 'image' | 'archive' | 'executable' | 'rtf' | 'text' | 'binary';

export interface DetectedType {
  /** The family the bytes prove. */
  family: TypeFamily;
  /** Human-readable description of what was found. */
  label: string;
  /** Mimetypes consistent with these bytes, most likely first. */
  mimetypes: readonly string[];
}

interface Signature {
  bytes: readonly number[];
  family: TypeFamily;
  label: string;
  mimetypes: readonly string[];
}

/** Ordered longest-prefix-first so a more specific match wins. */
const SIGNATURES: readonly Signature[] = [
  {
    bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
    family: 'ole2',
    label: 'OLE2 compound file (legacy .doc / .xls / .ppt)',
    mimetypes: ['application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'],
  },
  {
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    family: 'image',
    label: 'PNG image',
    mimetypes: ['image/png'],
  },
  {
    bytes: [0x25, 0x50, 0x44, 0x46, 0x2d],
    family: 'pdf',
    label: 'PDF document',
    mimetypes: ['application/pdf'],
  },
  {
    bytes: [0x7b, 0x5c, 0x72, 0x74, 0x66],
    family: 'rtf',
    label: 'RTF document',
    mimetypes: ['application/rtf', 'text/rtf'],
  },
  {
    bytes: [0x50, 0x4b, 0x03, 0x04],
    family: 'zip',
    label: 'ZIP container',
    mimetypes: ['application/zip'],
  },
  {
    bytes: [0x50, 0x4b, 0x05, 0x06],
    family: 'zip',
    label: 'ZIP container (empty archive)',
    mimetypes: ['application/zip'],
  },
  {
    bytes: [0x47, 0x49, 0x46, 0x38],
    family: 'image',
    label: 'GIF image',
    mimetypes: ['image/gif'],
  },
  {
    bytes: [0x52, 0x61, 0x72, 0x21],
    family: 'archive',
    label: 'RAR archive',
    mimetypes: ['application/vnd.rar'],
  },
  {
    bytes: [0x37, 0x7a, 0xbc, 0xaf],
    family: 'archive',
    label: '7-Zip archive',
    mimetypes: ['application/x-7z-compressed'],
  },
  {
    bytes: [0x7f, 0x45, 0x4c, 0x46],
    family: 'executable',
    label: 'ELF executable (Linux)',
    mimetypes: ['application/x-elf'],
  },
  {
    bytes: [0xcf, 0xfa, 0xed, 0xfe],
    family: 'executable',
    label: 'Mach-O executable (macOS)',
    mimetypes: ['application/x-mach-binary'],
  },
  {
    bytes: [0xca, 0xfe, 0xba, 0xbe],
    family: 'executable',
    label: 'Mach-O fat binary (macOS)',
    mimetypes: ['application/x-mach-binary'],
  },
  {
    bytes: [0xff, 0xd8, 0xff],
    family: 'image',
    label: 'JPEG image',
    mimetypes: ['image/jpeg'],
  },
  {
    bytes: [0x1f, 0x8b],
    family: 'archive',
    label: 'gzip archive',
    mimetypes: ['application/gzip'],
  },
  {
    bytes: [0x4d, 0x5a],
    family: 'executable',
    label: 'Windows executable (MZ)',
    mimetypes: ['application/vnd.microsoft.portable-executable'],
  },
];

/** True when `bytes` opens with every byte of `prefix`. */
export const startsWithBytes = (bytes: Uint8Array, prefix: readonly number[]): boolean =>
  bytes.length >= prefix.length && prefix.every((byte, index) => bytes[index] === byte);

/** Byte offset of an ASCII needle, or -1. Used to look inside containers. */
const findAscii = (bytes: Uint8Array, needle: string): number => {
  const target = [...new TextEncoder().encode(needle)];
  const limit = bytes.length - target.length;

  for (let start = 0; start <= limit; start += 1) {
    if (target.every((byte, offset) => bytes[start + offset] === byte)) return start;
  }
  return -1;
};

/** Byte offset of a UTF-16LE needle, as OLE2 stores its stream names. */
const findUtf16 = (bytes: Uint8Array, needle: string): number => {
  const target = [...new TextEncoder().encode(needle)].flatMap((byte) => [byte, 0]);
  const limit = bytes.length - target.length;

  for (let start = 0; start <= limit; start += 1) {
    if (target.every((byte, offset) => bytes[start + offset] === byte)) return start;
  }
  return -1;
};

/** Decode as UTF-8, or null when the bytes are not valid UTF-8 text. */
export const decodeUtf8 = (bytes: Uint8Array): string | null => {
  try {
    // stream: true tolerates a multi-byte character cut in half by the slice.
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes, { stream: true });
  } catch {
    return null;
  }
};

/** Bytes that mark otherwise-decodable content as binary. Tab, line feed,
 * vertical tab, form feed and carriage return are legitimate in text. */
const isControlByte = (byte: number): boolean => byte <= 0x08 || (byte >= 0x0e && byte <= 0x1f);

const OOXML_PARTS: readonly { marker: string; label: string; mimetype: string }[] = [
  {
    marker: 'word/',
    label: 'OOXML Word document (.docx)',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    marker: 'xl/',
    label: 'OOXML Excel workbook (.xlsx)',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    marker: 'ppt/',
    label: 'OOXML PowerPoint presentation (.pptx)',
    mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
];

/** Narrow a plain ZIP hit to the Office format it carries, when it is one. */
const refineZip = (bytes: Uint8Array, fallback: DetectedType): DetectedType => {
  const part = OOXML_PARTS.find(({ marker }) => findAscii(bytes, marker) !== -1);
  if (!part) return fallback;
  return { family: 'ooxml', label: part.label, mimetypes: [part.mimetype] };
};

/** Narrow an OLE2 hit to Word or Excel by its internal stream names. */
const refineOle2 = (bytes: Uint8Array, fallback: DetectedType): DetectedType => {
  if (findUtf16(bytes, 'WordDocument') !== -1) {
    return {
      family: 'ole2',
      label: 'OLE2 Word document (.doc)',
      mimetypes: ['application/msword'],
    };
  }
  if (findUtf16(bytes, 'Workbook') !== -1 || findUtf16(bytes, 'Book') !== -1) {
    return {
      family: 'ole2',
      label: 'OLE2 Excel workbook (.xls)',
      mimetypes: ['application/vnd.ms-excel'],
    };
  }
  return fallback;
};

const UTF16_LE_BOM = [0xff, 0xfe];
const UTF16_BE_BOM = [0xfe, 0xff];

const TEXT_MIMETYPES = ['text/plain', 'text/csv', 'application/json'] as const;

/** Identify a file from its leading bytes. */
export const detectType = (bytes: Uint8Array): DetectedType => {
  if (bytes.length === 0) {
    return { family: 'binary', label: 'empty file, nothing to identify', mimetypes: [] };
  }

  if (startsWithBytes(bytes, UTF16_LE_BOM) || startsWithBytes(bytes, UTF16_BE_BOM)) {
    const endian = startsWithBytes(bytes, UTF16_LE_BOM) ? 'little' : 'big';
    return {
      family: 'text',
      label: `UTF-16 text (${endian}-endian, byte order mark present)`,
      mimetypes: [...TEXT_MIMETYPES],
    };
  }

  const hit = SIGNATURES.find((signature) => startsWithBytes(bytes, signature.bytes));
  if (hit) {
    const found: DetectedType = { family: hit.family, label: hit.label, mimetypes: hit.mimetypes };
    if (hit.family === 'zip') return refineZip(bytes, found);
    if (hit.family === 'ole2') return refineOle2(bytes, found);
    return found;
  }

  const text = decodeUtf8(bytes);
  if (text === null) {
    return { family: 'binary', label: 'unrecognised binary, and not valid UTF-8', mimetypes: [] };
  }
  if (bytes.some((byte) => isControlByte(byte))) {
    return { family: 'binary', label: 'decodes as UTF-8 but carries control bytes', mimetypes: [] };
  }
  return { family: 'text', label: 'plain UTF-8 text', mimetypes: [...TEXT_MIMETYPES] };
};

/** Mimetype to the family its bytes would have to prove. */
const MIME_FAMILIES: Readonly<Record<string, TypeFamily>> = {
  'application/pdf': 'pdf',
  'application/msword': 'ole2',
  'application/vnd.ms-excel': 'ole2',
  'application/vnd.ms-powerpoint': 'ole2',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'ooxml',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'ooxml',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ooxml',
  'application/zip': 'zip',
  'application/gzip': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/bmp': 'image',
  'image/svg+xml': 'text',
  'text/plain': 'text',
  'text/csv': 'text',
  'text/html': 'text',
  'text/markdown': 'text',
  'text/xml': 'text',
  'text/yaml': 'text',
  'text/css': 'text',
  'application/xml': 'text',
  'application/json': 'text',
  'application/javascript': 'text',
  'application/sql': 'text',
  'application/x-yaml': 'text',
  'application/vnd.microsoft.portable-executable': 'executable',
  'application/x-mach-binary': 'executable',
  'application/x-elf': 'executable',
};

/** The family a mimetype claims, or null when the mimetype is unknown here. */
export const familyOfMimetype = (mimetype: string): TypeFamily | null =>
  MIME_FAMILIES[mimetype.trim().toLowerCase()] ?? null;

/** Extension to the mimetype a browser is expected to report for it. */
const EXTENSION_MIMES: Readonly<Record<string, string>> = {
  csv: 'text/csv',
  txt: 'text/plain',
  md: 'text/markdown',
  json: 'application/json',
  xml: 'application/xml',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  sql: 'application/sql',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  rtf: 'application/rtf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  zip: 'application/zip',
  gz: 'application/gzip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  exe: 'application/vnd.microsoft.portable-executable',
};

/** The mimetype an extension implies, or null when it is not a known one. */
export const mimetypeOfExtension = (extension: string): string | null =>
  EXTENSION_MIMES[extension.trim().toLowerCase().replace(/^\./, '')] ?? null;
