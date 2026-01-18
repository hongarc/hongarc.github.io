import { Link } from 'lucide-react';

import type { UrlMode } from '@/domain/encoding/url';
import { processUrl } from '@/domain/encoding/url';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getErrorMessage, getSelectInput, getTrimmedInput, success } from '@/utils';

const MODE_OPTIONS = ['encode', 'decode', 'encodeComponent', 'decodeComponent'] as const;

export const urlEncoder: ToolPlugin = {
  id: 'url-encode',
  label: 'URL Encoder',
  description: 'Encode and decode URL components online',
  category: 'encoding',
  icon: <Link className="h-4 w-4" />,
  keywords: ['url', 'encode', 'decode', 'uri', 'percent', 'escape'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Enter text to encode or URL-encoded text to decode',
      required: true,
      rows: 3,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
        { value: 'encodeComponent', label: 'Encode Component' },
        { value: 'decodeComponent', label: 'Decode Component' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'encode');

    if (!input) {
      return failure('Please enter text to process');
    }

    try {
      const result = processUrl(input, mode as UrlMode);
      const modeLabels: Record<UrlMode, string> = {
        encode: 'Encode (encodeURI)',
        decode: 'Decode (decodeURI)',
        encodeComponent: 'Encode Component',
        decodeComponent: 'Decode Component',
      };

      return success(result, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Mode', value: modeLabels[mode as UrlMode] },
            { label: 'Input', value: `${String(input.length)} chars` },
            { label: 'Output', value: `${String(result.length)} chars` },
          ],
          content: result,
          contentLabel: 'Result',
        },
      });
    } catch (error) {
      return failure(`Invalid input: ${getErrorMessage(error)}`);
    }
  },
};
