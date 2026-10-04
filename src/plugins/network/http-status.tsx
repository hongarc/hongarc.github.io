import { Globe } from 'lucide-react';

import { formatStatusLine, lookupStatus } from '@/domain/network/http-status';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

export const httpStatus: ToolPlugin = {
  id: 'http-status',
  label: 'HTTP Status Codes',
  description: 'Look up HTTP status codes by number, class or keyword, offline',
  category: 'network',
  icon: <Globe className="h-4 w-4" />,
  keywords: ['http', 'status', 'code', '404', '500', 'api', 'rest', 'response', 'error', 'teapot'],
  inputs: [
    {
      id: 'query',
      label: 'Code, class or keyword',
      type: 'text',
      placeholder: 'e.g. 404, 4xx, teapot, rate limit',
      helpText: 'Leave empty to list every status code',
    },
  ],
  transformer: (inputs) => {
    const query = getTrimmedInput(inputs, 'query');
    const matches = lookupStatus(query);

    if (matches.length === 0) {
      return failure(`No HTTP status matches "${query}"`);
    }

    const [first] = matches;
    if (matches.length === 1 && first) {
      return success(formatStatusLine(first), {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Code', value: String(first.code) },
            { label: 'Name', value: first.name },
          ],
          content: first.description,
          contentLabel: 'Description',
        },
      });
    }

    return success(matches.map((status) => formatStatusLine(status)).join('\n'));
  },
};
