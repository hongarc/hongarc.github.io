import { join, map } from 'ramda';

export type AlgorithmType = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

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
