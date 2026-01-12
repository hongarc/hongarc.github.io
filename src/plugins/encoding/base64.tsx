import { Binary } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import {
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getTrimmedInput,
  success,
  failure,
} from '@/utils';

const MODE_OPTIONS = ['encode', 'decode'] as const;

/**
 * Encode string to Base64 with UTF-8 support
 */
const encodeBase64 = (input: string, urlSafe: boolean): string => {
  const encoded = btoa(
    encodeURIComponent(input).replaceAll(/%([0-9A-F]{2})/g, (_, p1: string) =>
      String.fromCodePoint(Number.parseInt(p1, 16))
    )
  );

  if (urlSafe) {
    return encoded.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }
  return encoded;
};

/**
 * Decode Base64 to string with UTF-8 support
 */
const decodeBase64 = (input: string, urlSafe: boolean): string => {
  let base64 = input;

  if (urlSafe) {
    base64 = base64.replaceAll('-', '+').replaceAll('_', '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.codePointAt(i) ?? 0;
  }
  return new TextDecoder().decode(bytes);
};

export const base64Encoder: ToolPlugin = {
  id: 'base64-encoder',
  label: 'Base64 Encode/Decode',
  description: 'Encode or decode Base64 strings',
  category: 'encoding',
  icon: <Binary className="h-4 w-4" />,
  keywords: ['base64', 'encode', 'decode', 'binary', 'string'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Enter text to encode or Base64 to decode',
      required: true,
      rows: 6,
      sensitive: true,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { value: 'encode', label: 'Encode to Base64' },
        { value: 'decode', label: 'Decode from Base64' },
      ],
    },
    {
      id: 'urlSafe',
      label: 'URL Safe',
      type: 'checkbox',
      defaultValue: false,
      placeholder: 'Use URL-safe Base64 (replace +/ with -_)',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'encode');
    const urlSafe = getBooleanInput(inputs, 'urlSafe');

    if (!input) {
      return failure('Please enter text to process');
    }

    try {
      const result =
        mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe);

      const modeLabel = mode === 'encode' ? 'Encoded' : 'Decoded';

      return success(result, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Mode', value: mode === 'encode' ? 'Encode' : 'Decode' },
            { label: 'URL Safe', value: urlSafe ? 'Yes' : 'No' },
            { label: 'Input', value: `${String(input.length)} chars` },
            { label: 'Output', value: `${String(result.length)} chars` },
          ],
          content: result,
          contentLabel: modeLabel,
        },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      if (mode === 'decode') {
        return failure(`Invalid Base64 input: ${message}`);
      }
      return failure(message);
    }
  },
};
