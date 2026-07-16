import { ShieldCheck } from 'lucide-react';

import {
  CHECKSUM_ALGOS,
  computeAllHashes,
  createHashers,
  matchChecksum,
  type AllHashes,
} from '@/domain/crypto/hash';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getStringInput,
  getTrimmedInput,
  instruction,
  success,
} from '@/utils';

const INPUT_TYPE_OPTIONS = ['text', 'file'] as const;

/** Maximum bytes per streaming chunk (8 MiB). */
const CHUNK = 8 * 1024 * 1024;

/**
 * Format a byte count for human-readable display.
 * Covers B, KB, MB, and GB (for large ISOs).
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/**
 * Stream a File through all four hashers in ≤8 MiB chunks.
 * Never holds the whole file in memory — safe for multi-GB ISOs.
 */
const hashFileStreaming = async (file: File): Promise<AllHashes> => {
  const hashers = await createHashers();
  let offset = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK);
    const buffer = await slice.arrayBuffer();
    hashers.update(new Uint8Array(buffer));
    offset += CHUNK;
  }

  return hashers.digest();
};

/** Mapping from ChecksumAlgo display name to AllHashes field. */
const ALGO_FIELD_MAP: Record<(typeof CHECKSUM_ALGOS)[number], keyof AllHashes> = {
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-256': 'sha256',
  'SHA-512': 'sha512',
};

export const hashGenerator: ToolPlugin = {
  id: 'hash',
  label: 'Hash & Checksum',
  description:
    'Compute MD5, SHA-1, SHA-256, SHA-512 and verify a file or text against any checksum. MD5 and SHA-1 are legacy (not collision-resistant) — prefer SHA-256 or stronger for security.',
  category: 'crypto',
  icon: <ShieldCheck className="h-4 w-4" />,
  keywords: [
    'hash',
    'checksum',
    'verify',
    'md5',
    'sha1',
    'sha256',
    'sha512',
    'digest',
    'file',
    'compare',
    'integrity',
  ],
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
      id: 'expected',
      label: 'Expected checksum (optional)',
      type: 'text',
      placeholder: "Paste the publisher's checksum to verify",
      helpText:
        'Auto-detects the algorithm (MD5/SHA-1/SHA-256/SHA-512). Leave empty to just compute all hashes.',
      sensitive: false,
    },
  ],
  transformer: async (inputs) => {
    const inputType = getSelectInput(inputs, 'inputType', INPUT_TYPE_OPTIONS, 'text');
    const text = getStringInput(inputs, 'input');
    const file = inputs.file as File | undefined;
    const uppercase = getBooleanInput(inputs, 'uppercase');
    const expected = getTrimmedInput(inputs, 'expected');

    try {
      let hashes: AllHashes;
      let inputInfo: string;

      if (inputType === 'file') {
        if (!file) return instruction('Select a file to compute and verify checksums');
        hashes = await hashFileStreaming(file);
        inputInfo = `${file.name} (${formatFileSize(file.size)})`;
      } else {
        if (!text) return instruction('Enter text to hash, or switch Source to File');
        hashes = await computeAllHashes(text);
        inputInfo = `${String(text.length)} chars`;
      }

      const match = matchChecksum(expected, hashes);

      // Build stats array
      const stats: {
        label: string;
        value: string;
        type?: 'text' | 'badge';
        variant?: 'success' | 'error' | 'default';
        tooltip?: string;
      }[] = [{ label: 'Input', value: inputInfo }];

      // Verification badge — only when a checksum was pasted
      if (expected.length > 0) {
        const matchedAlgo = match.algo;
        if (matchedAlgo) {
          const isWeak = matchedAlgo === 'MD5' || matchedAlgo === 'SHA-1';
          stats.push({
            label: 'Verification',
            value: `Matches ${matchedAlgo}${isWeak ? ' (legacy)' : ''}`,
            type: 'badge',
            variant: 'success',
            tooltip: isWeak
              ? `Matched via ${matchedAlgo}, a legacy algorithm — a match confirms the published checksum, but ${matchedAlgo} is not collision-resistant.`
              : 'Auto-detected by comparing the pasted checksum against all four hashes using constant-time comparison.',
          });
        } else {
          stats.push({
            label: 'Verification',
            value: 'No match',
            type: 'badge',
            variant: 'error',
            tooltip:
              'The pasted checksum did not match any of the computed hashes (MD5/SHA-1/SHA-256/SHA-512).',
          });
        }
      }

      // Build content: four lines, one per algo, padded for alignment
      // The matched line gets a ✓ marker (human-gate decision #3)
      const contentLines = CHECKSUM_ALGOS.map((algo) => {
        const field = ALGO_FIELD_MAP[algo];
        const value = uppercase ? hashes[field].toUpperCase() : hashes[field];
        const marker = match.algo === algo ? ' ✓' : '';
        return `${algo.padEnd(7)} ${value}${marker}`;
      });
      const contentString = contentLines.join('\n');

      return success(contentString, {
        _viewMode: 'sections',
        _sections: {
          stats,
          content: contentString,
          contentLabel: 'Checksums',
          perLineCopy: true,
        },
      });
    } catch (error) {
      return failure(getErrorMessage(error));
    }
  },
};
