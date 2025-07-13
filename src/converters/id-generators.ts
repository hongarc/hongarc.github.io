// ID Generators
export interface IdGenerator {
  name: string;
  description: string;
  generate: () => string;
  example: string;
}

// Custom nanoid implementation
function customNanoid(size: number = 21): string {
  const alphabet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let index = 0; index < size; index++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

// Custom cuid implementation
function customCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2);
  const counter = Math.floor(Math.random() * 1000).toString(36);
  return `c${timestamp}${random}${counter}`;
}

// Custom ulid implementation
function customUlid(): string {
  const timestamp = Date.now();
  const time = timestamp.toString(36).padStart(10, '0');
  const random = Math.random().toString(36).slice(2, 15);
  return time + random;
}

// Custom cuid2 implementation
function customCuid2(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 15);
  return `c${timestamp}${random}`;
}

// UUID v4 implementation
function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(
    /[xy]/g,
    function (c) {
      const r = Math.trunc(Math.random() * 16);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

// UUID v1 implementation
function generateUuidV1(): string {
  const timestamp = Date.now();
  const timeLow = (timestamp & 4_294_967_295).toString(16).padStart(8, '0');
  const timeMid = ((timestamp >> 32) & 65_535).toString(16).padStart(4, '0');
  const timeHigh = ((timestamp >> 48) & 4095).toString(16).padStart(3, '0');
  const random = Math.random().toString(16).slice(2, 14);
  return `${timeLow}-${timeMid}-1${timeHigh}-${random.slice(0, 4)}-${random.slice(4)}`;
}

export const idGenerators: IdGenerator[] = [
  {
    name: 'nanoid',
    description: 'URL-friendly unique string ID generator',
    generate: () => customNanoid(),
    example: customNanoid(),
  },
  {
    name: 'cuid',
    description: 'Collision-resistant unique identifier',
    generate: () => customCuid(),
    example: customCuid(),
  },
  {
    name: 'ulid',
    description: 'Universally Unique Lexicographically Sortable Identifier',
    generate: () => customUlid(),
    example: customUlid(),
  },
  {
    name: 'cuid2',
    description: 'Secure, collision-resistant unique identifier',
    generate: () => customCuid2(),
    example: customCuid2(),
  },
  {
    name: 'uuid-v4',
    description: 'Random UUID version 4',
    generate: () => generateUuidV4(),
    example: generateUuidV4(),
  },
  {
    name: 'uuid-v1',
    description: 'Time-based UUID version 1',
    generate: () => generateUuidV1(),
    example: generateUuidV1(),
  },
  {
    name: 'crypto-random-uuid',
    description: 'Cryptographically secure random UUID',
    generate: () => {
      // Use global crypto if available, otherwise fallback to UUID v4
      if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
      }
      return generateUuidV4();
    },
    example: generateUuidV4(),
  },
];

export function generateId(type: string): string {
  const generator = idGenerators.find(g => g.name === type);
  return generator ? generator.generate() : '';
}

export function getAllIdTypes(): string[] {
  return idGenerators.map(g => g.name);
}

export function getIdGeneratorInfo(type: string): IdGenerator | undefined {
  return idGenerators.find(g => g.name === type);
}
