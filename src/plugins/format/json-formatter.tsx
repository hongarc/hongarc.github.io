import { Braces } from 'lucide-react';

import { JsonEditor } from '@/components/tool/json-editor';
import type { ToolPlugin } from '@/types/plugin';
import { success } from '@/utils';

export const jsonFormatter: ToolPlugin = {
  id: 'json-formatter',
  label: 'JSON Editor',
  description: 'Beautify, minify, sort keys, and query JSON with JSONPath',
  category: 'format',
  icon: <Braces className="h-4 w-4" />,
  keywords: [
    'json',
    'format',
    'beautify',
    'minify',
    'validate',
    'pretty',
    'jsonpath',
    'query',
    'editor',
    'sort',
  ],
  inputs: [],
  transformer: () => success(''),
  customComponent: JsonEditor,
};
