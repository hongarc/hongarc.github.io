import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';
// import { nanoid } from 'nanoid';
// import cuid from 'cuid';
// import { ulid } from 'ulid';

export interface IdGenerator {
  name: string;
  generate: (options?: any) => string;
  description: string;
}

// UUID v4 Generator (default)
export function generateUuidV4(): string {
  return uuidv4();
}

// UUID v1 Generator
export function generateUuidV1(): string {
  return uuidv1();
}

// NanoID Generator
export function generateNanoId(length: number = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// CUID Generator
export function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `c${timestamp}${random}`;
}

// ULID Generator
export function generateUlid(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp.toString(36)}${random}`.toUpperCase();
}

// HEX string generator
export function generateHexId(length: number = 32): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Main ID generator function
export function generateId(type: string = 'uuid', options: any = {}): string {
  switch (type.toLowerCase()) {
    case 'uuid':
    case 'uuidv4':
      return generateUuidV4();
    case 'uuidv1':
      return generateUuidV1();
    case 'nanoid':
      return generateNanoId(options.length || 21);
    case 'cuid':
      return generateCuid();
    case 'ulid':
      return generateUlid();
    case 'hex':
      return generateHexId(options.length || 32);
    default:
      throw new Error(`Unsupported ID type: ${type}`);
  }
}

// Get all available ID types
export function getAvailableIdTypes(): IdGenerator[] {
  return [
    {
      name: 'UUID v4',
      generate: () => generateUuidV4(),
      description: 'Random UUID v4 (default)'
    },
    {
      name: 'UUID v1',
      generate: () => generateUuidV1(),
      description: 'Time-based UUID v1'
    },
    {
      name: 'NanoID',
      generate: (options) => generateNanoId(options?.length || 21),
      description: 'URL-friendly unique ID'
    },
    {
      name: 'CUID',
      generate: () => generateCuid(),
      description: 'Collision-resistant unique ID'
    },
    {
      name: 'ULID',
      generate: () => generateUlid(),
      description: 'Universally unique lexicographically sortable ID'
    },
    {
      name: 'HEX',
      generate: (options) => generateHexId(options?.length || 32),
      description: 'Hexadecimal string ID'
    }
  ];
}

// Examples
export const idGeneratorExamples = {
  uuid: {
    input: 'uuid',
    output: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Generate UUID v4'
  },
  nanoid: {
    input: 'nanoid',
    output: 'V1StGXR8_Z5jdHi6B-myT',
    description: 'Generate NanoID (21 chars)'
  },
  cuid: {
    input: 'cuid',
    output: 'cjld2cjxh0000qzrmn831i7rn',
    description: 'Generate CUID'
  },
  ulid: {
    input: 'ulid',
    output: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    description: 'Generate ULID'
  },
  hex: {
    input: 'hex',
    output: 'a1b2c3d4e5f678901234567890123456',
    description: 'Generate 32-character HEX ID'
  }
};