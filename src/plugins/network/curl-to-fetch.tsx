import { ArrowRightLeft } from 'lucide-react';

import { parseCurl, toFetch } from '@/domain/network/curl-to-fetch';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

export const curlToFetch: ToolPlugin = {
  id: 'curl-to-fetch',
  label: 'cURL to fetch',
  description: 'Convert a cURL command into a JavaScript fetch call, locally',
  category: 'network',
  icon: <ArrowRightLeft className="h-4 w-4" />,
  keywords: ['curl', 'fetch', 'http', 'request', 'javascript', 'api', 'convert', 'postman'],
  inputs: [
    {
      id: 'input',
      label: 'cURL command',
      type: 'textarea',
      placeholder: "curl -X POST https://api.example.com/users -H 'Content-Type: application/json'",
      helpText: 'Converted in your browser. The request is never sent.',
      rows: 8,
      codeLanguage: 'bash',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    if (!input) {
      return failure('Paste a cURL command to convert it to fetch');
    }

    const parsed = parseCurl(input);
    if ('error' in parsed) {
      return failure(parsed.error);
    }

    return success(toFetch(parsed), { _language: 'javascript' });
  },
};
