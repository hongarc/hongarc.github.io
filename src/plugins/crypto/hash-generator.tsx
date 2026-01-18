import { Hash } from 'lucide-react';

import { computeHash, computeHashFromBuffer, secureCompare } from '@/domain/crypto/hash';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getStringInput,
  getTrimmedInput,
  success,
} from '@/utils';

const ALGORITHM_OPTIONS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

const INPUT_TYPE_OPTIONS = ['text', 'file'] as const;

/**
 * Read file as ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => file.arrayBuffer();

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const hashGenerator: ToolPlugin = {
  id: 'hash',
  label: 'Hash Generator',
  description: 'Generate and verify MD5, SHA-1, SHA-256, SHA-512 hashes online',
  category: 'crypto',
  icon: <Hash className="h-4 w-4" />,
  keywords: ['hash', 'sha', 'sha256', 'sha512', 'checksum', 'digest', 'verify', 'compare', 'file'],
  isAsync: true,
  inputs: [
    {
      id: 'inputType',
      label: 'Source',
      type: 'select',
      defaultValue: 'text',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'file', label: 'File' },
      ],
      group: 'row1',
    },
    {
      id: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      defaultValue: 'SHA-256',
      options: [
        { value: 'SHA-1', label: 'SHA-1' },
        { value: 'SHA-256', label: 'SHA-256' },
        { value: 'SHA-384', label: 'SHA-384' },
        { value: 'SHA-512', label: 'SHA-512' },
      ],
      group: 'row1',
    },
    {
      id: 'input',
      label: 'Input Text',
      type: 'textarea',
      placeholder: 'Enter text to hash...',
      rows: 3,
      visibleWhen: { inputId: 'inputType', value: 'text' },
      sensitive: true,
    },
    {
      id: 'file',
      label: 'Input File',
      type: 'file',
      accept: '*/*',
      visibleWhen: { inputId: 'inputType', value: 'file' },
      sensitive: true,
    },
    {
      id: 'uppercase',
      label: 'Uppercase output',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'compareHash',
      label: 'Compare (optional)',
      type: 'text',
      placeholder: 'Paste hash to verify',
      sensitive: true,
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
