import { createId } from '@paralleldrive/cuid2';
import { ObjectId } from 'bson';
import { nanoid } from 'nanoid';
import { ulid } from 'ulid';
import { v4 as uuidV4, v1 as uuidV1 } from 'uuid';

// ID Generators
export interface IdGenerator {
  name: string;
  description: string;
  generate: () => string;
  example: string;
}

export const idGenerators: IdGenerator[] = [
  {
    name: 'nanoid',
    description: 'URL-friendly unique string ID generator',
    generate: () => nanoid(),
    example: nanoid(),
  },
  {
    name: 'cuid',
    description: 'Collision-resistant unique identifier',
    generate: () => {
      // Use cuid library for proper cuid generation
      const { createId: createCuid } = require('cuid');
      return createCuid();
    },
    example: 'cuid-example-id',
  },
  {
    name: 'cuid2',
    description: 'Secure, collision-resistant unique identifier',
    generate: () => createId(),
    example: createId(),
  },
  {
    name: 'ulid',
    description: 'Universally Unique Lexicographically Sortable Identifier',
    generate: () => ulid(),
    example: ulid(),
  },
  {
    name: 'uuid-v4',
    description: 'Random UUID version 4',
    generate: () => uuidV4(),
    example: uuidV4(),
  },
  {
    name: 'uuid-v1',
    description: 'Time-based UUID version 1',
    generate: () => uuidV1(),
    example: uuidV1(),
  },
  {
    name: 'mongodbid',
    description: 'MongoDB ObjectId (24-character hex string)',
    generate: () => new ObjectId().toString(),
    example: new ObjectId().toString(),
  },
];

export function generateId(type: string): string {
  const generator = idGenerators.find(g => g.name === type);
  if (!generator) {
    throw new Error(`Invalid generator type: ${type}`);
  }
  return generator.generate();
}

export function getAllIdTypes(): string[] {
  return idGenerators.map(g => g.name);
}

export function getIdGeneratorInfo(type: string): IdGenerator | undefined {
  return idGenerators.find(g => g.name === type);
}
