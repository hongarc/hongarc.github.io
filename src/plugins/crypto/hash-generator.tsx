import { Hash } from 'lucide-react';
import { join, map } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import {
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getStringInput,
  getTrimmedInput,
  success,
  failure,
} from '@/utils';

const ALGORITHM_OPTIONS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type AlgorithmType = (typeof ALGORITHM_OPTIONS)[number];

const INPUT_TYPE_OPTIONS = ['text', 'file'] as const;

/**
 * Convert ArrayBuffer to hex string using Ramda
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = [...new Uint8Array(buffer)];
  return join(
    '',
    map((b: number) => b.toString(16).padStart(2, '0'), bytes)
  );
};

/**
 * Compute hash from ArrayBuffer using Web Crypto API
 */
const computeHashFromBuffer = async (
  data: ArrayBuffer,
  algorithm: AlgorithmType
): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(hashBuffer);
};

/**
 * Compute hash from text using Web Crypto API
 */
const computeHash = async (text: string, algorithm: AlgorithmType): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return computeHashFromBuffer(data.buffer as ArrayBuffer, algorithm);
};

/**
 * Read file as ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => file.arrayBuffer();

/**
 * Constant-time string comparison to prevent timing attacks
 */
const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return result === 0;
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const hashGenerator: ToolPlugin = {
  id: 'hash-generator',
  label: 'Hash Generator',
  description: 'Generate and verify SHA-1, SHA-256, SHA-384, or SHA-512 hashes',
  category: 'crypto',
  icon: <Hash className="h-4 w-4" />,
  keywords: ['hash', 'sha', 'sha256', 'sha512', 'checksum', 'digest', 'verify', 'compare', 'file'],
  isAsync: true,
  inputs: [
    {
      id: 'inputType',
      label: 'Input Type',
      type: 'select',
      defaultValue: 'text',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'file', label: 'File' },
      ],
    },
    {
      id: 'input',
      label: 'Input Text',
      type: 'textarea',
      placeholder: 'Enter text to hash',
      rows: 4,
      visibleWhen: { inputId: 'inputType', value: 'text' },
    },
    {
      id: 'file',
      label: 'Select File',
      type: 'file',
      accept: '*/*',
      visibleWhen: { inputId: 'inputType', value: 'file' },
    },
    {
      id: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      defaultValue: 'SHA-256',
      options: [
        { value: 'SHA-1', label: 'SHA-1 (40 chars)' },
        { value: 'SHA-256', label: 'SHA-256 (64 chars)' },
        { value: 'SHA-384', label: 'SHA-384 (96 chars)' },
        { value: 'SHA-512', label: 'SHA-512 (128 chars)' },
      ],
    },
    {
      id: 'uppercase',
      label: 'Uppercase',
      type: 'checkbox',
      defaultValue: false,
      placeholder: 'Output in uppercase',
    },
    {
      id: 'compareHash',
      label: 'Compare With (optional)',
      type: 'textarea',
      placeholder: 'Paste a hash here to verify if it matches',
      rows: 2,
      helpText: 'Leave empty to only generate hash',
    },
  ],
  transformer: async (inputs) => {
    const inputType = getSelectInput(inputs, 'inputType', INPUT_TYPE_OPTIONS, 'text');
    const input = getStringInput(inputs, 'input');
    const file = inputs.file as File | undefined;
    const compareHash = getTrimmedInput(inputs, 'compareHash');
    const algorithm = getSelectInput(inputs, 'algorithm', ALGORITHM_OPTIONS, 'SHA-256');
    const uppercase = getBooleanInput(inputs, 'uppercase');

    try {
      let hash: string;
      let inputInfo: string;

      if (inputType === 'file') {
        if (!file) {
          return failure('Please select a file to hash');
        }
        const buffer = await readFileAsArrayBuffer(file);
        hash = await computeHashFromBuffer(buffer, algorithm);
        inputInfo = `${file.name} (${formatFileSize(file.size)})`;
      } else {
        if (!input) {
          return failure('Please enter text to hash');
        }
        hash = await computeHash(input, algorithm);
        inputInfo = `${String(input.length)} chars`;
      }

      if (uppercase) {
        hash = hash.toUpperCase();
      }

      // Build stats array
      const stats: {
        label: string;
        value: string;
        type?: 'text' | 'badge';
        variant?: 'success' | 'error' | 'default';
      }[] = [
        { label: 'Algorithm', value: algorithm },
        { label: 'Length', value: `${String(hash.length)} chars` },
        { label: 'Input', value: inputInfo },
      ];

      // Add verification if compare hash is provided
      if (compareHash) {
        const normalizedExpected = uppercase
          ? compareHash.toUpperCase()
          : compareHash.toLowerCase();
        const normalizedComputed = uppercase ? hash.toUpperCase() : hash.toLowerCase();
        const isMatch = secureCompare(normalizedComputed, normalizedExpected);

        stats.push({
          label: 'Verification',
          value: isMatch ? 'Match' : 'No Match',
          type: 'badge',
          variant: isMatch ? 'success' : 'error',
        });
      }

      return success(hash, {
        _viewMode: 'sections',
        _sections: {
          stats,
          content: hash,
          contentLabel: 'Hash',
        },
      });
    } catch (error) {
      return failure(getErrorMessage(error));
    }
  },
};
