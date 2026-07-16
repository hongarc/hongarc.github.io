import { Fingerprint } from 'lucide-react';
import { join, pipe, times } from 'ramda';

import { generateId } from '@/domain/generators/id';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

// ID type options
const TYPE_OPTIONS = ['uuidv4', 'uuidv7', 'cuid', 'mongodb'] as const;

// Apply formatting options
const formatId = (id: string, uppercase: boolean, noDashes: boolean): string => {
  let result = id;
  if (noDashes) {
    result = result.replaceAll('-', '');
  }
  if (uppercase) {
    result = result.toUpperCase();
  }
  return result;
};

// Generate multiple IDs
const generateIds = (
  type: (typeof TYPE_OPTIONS)[number],
  count: number,
  uppercase: boolean,
  noDashes: boolean
): string =>
  pipe(
    times(() => formatId(generateId(type), uppercase, noDashes)),
    join('\n')
  )(count);

// Get type label
const getTypeLabel = (type: (typeof TYPE_OPTIONS)[number]): string => {
  switch (type) {
    case 'uuidv4': {
      return 'UUID v4 (Random)';
    }
    case 'uuidv7': {
      return 'UUID v7 (Time-based)';
    }
    case 'cuid': {
      return 'CUID (Collision-resistant)';
    }
    case 'mongodb': {
      return 'MongoDB ObjectID';
    }
    default: {
      return type;
    }
  }
};

export const uuidGenerator: ToolPlugin = {
  id: 'uuid',
  label: 'UUID Generator',
  description: 'Generate UUID v4, CUID, NanoID, and ULID online',
  category: 'text',
  icon: <Fingerprint className="h-4 w-4" />,
  keywords: ['uuid', 'guid', 'cuid', 'mongodb', 'objectid', 'nanoid', 'unique', 'id', 'identifier'],
  preferFresh: true,
  inputs: [
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      defaultValue: 'uuidv4',
      options: [
        { value: 'uuidv4', label: 'UUID v4' },
        { value: 'uuidv7', label: 'UUID v7' },
        { value: 'cuid', label: 'CUID' },
        { value: 'mongodb', label: 'MongoDB' },
      ],
      group: 'row1',
    },
    {
      id: 'count',
      label: 'Count',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100,
      group: 'row1',
    },
    {
      id: 'uppercase',
      label: 'Uppercase',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'noDashes',
      label: 'No dashes',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  transformer: (inputs) => {
    const type = getSelectInput(inputs, 'type', TYPE_OPTIONS, 'uuidv4');
    const count = Math.min(Math.max(getNumberInput(inputs, 'count', 5), 1), 100);
    const uppercase = getBooleanInput(inputs, 'uppercase');
    const noDashes = getBooleanInput(inputs, 'noDashes');

    try {
      const result = generateIds(type, count, uppercase, noDashes);
      const sampleId = result.split('\n')[0] ?? '';

      return success(result, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            {
              label: 'Type',
              value: getTypeLabel(type),
              tooltip:
                type === 'uuidv4'
                  ? 'Fully random, best for most use cases.'
                  : type === 'uuidv7'
                    ? 'Time-sortable, good for databases.'
                    : type === 'cuid'
                      ? 'Collision-resistant, URL-friendly.'
                      : 'MongoDB native ID format.',
            },
            { label: 'Length', value: `${String(sampleId.length)} chars` },
          ],
          content: result,
          contentLabel: `IDs (${String(count)})`,
          perLineCopy: true,
        },
      });
    } catch (error) {
      return failure(
        `Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
