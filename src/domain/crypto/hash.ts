import { createMD5, createSHA1, createSHA256, createSHA512 } from 'hash-wasm';
import { join, map } from 'ramda';

export type AlgorithmType = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export type ChecksumAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface AllHashes {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export interface ChecksumMatch {
  /** Which algorithm the expected checksum matched, or null if none. */
  algo: ChecksumAlgo | null;
}

export interface IncrementalHashers {
  update: (chunk: Uint8Array) => void;
  digest: () => AllHashes;
}

/** Display order — single source of truth for plugin and matcher. */
export const CHECKSUM_ALGOS: ChecksumAlgo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

/**
 * Convert ArrayBuffer to hex string using Ramda
 */
export const bufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = [...new Uint8Array(buffer)];
  return join(
    '',
    map((b: number) => b.toString(16).padStart(2, '0'), bytes)
  );
};

/**
 * Compute hash from ArrayBuffer using Web Crypto API
 */
export const computeHashFromBuffer = async (
  data: ArrayBuffer,
  algorithm: AlgorithmType
): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(hashBuffer);
};

/**
 * Compute hash from text using Web Crypto API
 */
export const computeHash = async (text: string, algorithm: AlgorithmType): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return computeHashFromBuffer(data.buffer as ArrayBuffer, algorithm);
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    /* v8 ignore next */
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return result === 0;
};

/**
 * Create four incremental hashers (MD5, SHA-1, SHA-256, SHA-512) for streaming.
 * All four WASM modules are initialised in parallel.
 * The returned object is single-use: call update() for each chunk, then digest().
 */
export const createHashers = async (): Promise<IncrementalHashers> => {
  const [md5h, sha1h, sha256h, sha512h] = await Promise.all([
    createMD5(),
    createSHA1(),
    createSHA256(),
    createSHA512(),
  ]);

  return {
    update(chunk: Uint8Array) {
      md5h.update(chunk);
      sha1h.update(chunk);
      sha256h.update(chunk);
      sha512h.update(chunk);
    },
    digest(): AllHashes {
      return {
        md5: md5h.digest('hex'),
        sha1: sha1h.digest('hex'),
        sha256: sha256h.digest('hex'),
        sha512: sha512h.digest('hex'),
      };
    },
  };
};

/**
 * One-shot convenience: compute all four hashes for in-memory data.
 * Accepts a string or a Uint8Array; strings are UTF-8 encoded.
 * Returns lowercase hex for all four algorithms.
 */
export const computeAllHashes = async (data: Uint8Array | string): Promise<AllHashes> => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashers = await createHashers();
  hashers.update(bytes);
  return hashers.digest();
};

/** Map ChecksumAlgo → AllHashes field name. */
const ALGO_FIELD: Record<ChecksumAlgo, keyof AllHashes> = {
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-256': 'sha256',
  'SHA-512': 'sha512',
};

/**
 * Auto-detect which (if any) of the four algorithms the expected checksum matches.
 * Pure, synchronous, never throws.
 * Matching is case-insensitive; leading/trailing whitespace in expected is tolerated.
 */
export const matchChecksum = (expected: string, hashes: AllHashes): ChecksumMatch => {
  const normalised = expected.trim().toLowerCase();
  if (normalised.length === 0) return { algo: null };

  for (const algo of CHECKSUM_ALGOS) {
    const field = ALGO_FIELD[algo];
    if (secureCompare(hashes[field].toLowerCase(), normalised)) {
      return { algo };
    }
  }

  return { algo: null };
};
