import { Fingerprint } from 'lucide-react';
import { join, pipe, times } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

// ID type options
const TYPE_OPTIONS = ['uuidv4', 'uuidv7', 'cuid', 'mongodb'] as const;

// Pure function: generate secure random bytes as hex
const randomHex = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Generate UUID v4 (random)
const generateUuidV4 = (): string => {
  return crypto.randomUUID();
};

// Generate UUID v7 (time-based + random)
const generateUuidV7 = (): string => {
  const now = Date.now();
  const timestamp = now.toString(16).padStart(12, '0');

  // Random bytes for the rest
  const random = randomHex(10);

  // Construct UUID v7
  // Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
  // t = timestamp, 7 = version, y = variant (8, 9, a, or b), x = random
  const uuid = [
    timestamp.slice(0, 8),
    timestamp.slice(8, 12),
    `7${random.slice(0, 3)}`,
    ((Number.parseInt(random.slice(3, 4), 16) & 0x3) | 0x8).toString(16) + random.slice(4, 7),
    random.slice(7, 19).padEnd(12, '0'),
  ].join('-');

  return uuid;
};

// Generate CUID (Collision-resistant Unique Identifier)
const generateCuid = (): string => {
  const timestamp = Date.now().toString(36);
  const counter = Math.floor(Math.random() * 1_679_616)
    .toString(36)
    .padStart(4, '0');
  const fingerprint = randomHex(4);
  const random = randomHex(8);

  // CUID format: c + timestamp + counter + fingerprint + random
  return `c${timestamp}${counter}${fingerprint.slice(0, 4)}${random.slice(0, 8)}`;
};

// Generate MongoDB ObjectID (24 hex characters)
const generateMongoId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0');
  const machineId = randomHex(3);
  const processId = randomHex(2);
  const counter = randomHex(3);

  return timestamp + machineId + processId + counter;
};

// ID generator based on type
const generateId = (type: (typeof TYPE_OPTIONS)[number]): string => {
  switch (type) {
    case 'uuidv4': {
      return generateUuidV4();
    }
    case 'uuidv7': {
      return generateUuidV7();
    }
    case 'cuid': {
      return generateCuid();
    }
    case 'mongodb': {
      return generateMongoId();
    }
    default: {
      return generateUuidV4();
    }
  }
};

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
            { label: 'Type', value: getTypeLabel(type) },
            { label: 'Length', value: `${String(sampleId.length)} chars` },
          ],
          content: result,
          contentLabel: `IDs (${String(count)})`,
        },
      });
    } catch (error) {
      return failure(
        `Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
