import { Binary } from 'lucide-react';

import { decodeBase64, encodeBase64 } from '@/domain/encoding/base64';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getTrimmedInput,
  success,
} from '@/utils';

const MODE_OPTIONS = ['encode', 'decode'] as const;

export const base64Encoder: ToolPlugin = {
  id: 'base64',
  label: 'Base64 Tool',
  description: 'Encode and decode Base64 strings online',
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
      rows: 4,
      sensitive: true,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
      group: 'options',
    },
    {
      id: 'urlSafe',
      label: 'URL Safe',
      type: 'checkbox',
      defaultValue: false,
      group: 'options',
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
            {
              label: 'URL Safe',
              value: urlSafe ? 'Yes' : 'No',
              tooltip: 'Replaces +/ with -_ for safe use in URLs and filenames.',
            },
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
