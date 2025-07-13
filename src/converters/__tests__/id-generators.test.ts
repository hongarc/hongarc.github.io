import { generateId } from '../id-generators';

// Mock crypto.randomUUID for consistent testing
let uuidCounter = 0;
const mockCryptoUUID = () => {
  uuidCounter++;
  return `12345678-1234-1234-1234-${uuidCounter.toString().padStart(12, '0')}`;
};

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: jest.fn(mockCryptoUUID),
  },
  writable: true,
});

// Mock performance for testing
Object.defineProperty(globalThis, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

describe('ID Generators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uuidCounter = 0;
  });

  describe('UUID v4', () => {
    it('should generate valid UUID v4 format', () => {
      const result = generateId('uuid-v4');

      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateId('uuid-v4');
      const uuid2 = generateId('uuid-v4');

      expect(uuid1).not.toBe(uuid2);
    });

    it('should have correct version and variant bits', () => {
      const uuid = generateId('uuid-v4');
      const parts = uuid.split('-');

      // Version 4: first digit of third group should be 4
      expect(parts[2][0]).toBe('4');

      // Variant: first digit of fourth group should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(parts[3][0]);
    });
  });

  describe('NanoID', () => {
    it('should generate valid NanoID format', () => {
      const result = generateId('nanoid');

      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(result).toHaveLength(21); // Default NanoID length
    });

    it('should generate unique NanoIDs', () => {
      const nano1 = generateId('nanoid');
      const nano2 = generateId('nanoid');

      expect(nano1).not.toBe(nano2);
    });

    it('should only contain URL-safe characters', () => {
      const nano = generateId('nanoid');

      // Should not contain characters that need URL encoding
      expect(nano).not.toMatch(/[^A-Za-z0-9_-]/);
    });
  });

  describe('CUID', () => {
    it('should generate valid CUID format', () => {
      const result = generateId('cuid');

      expect(result).toMatch(/^c[a-z0-9]{24}$/);
    });

    it('should generate unique CUIDs', () => {
      const cuid1 = generateId('cuid');
      const cuid2 = generateId('cuid');

      expect(cuid1).not.toBe(cuid2);
    });

    it('should start with "c"', () => {
      const cuid = generateId('cuid');
      expect(cuid[0]).toBe('c');
    });
  });

  describe('CUID2', () => {
    it('should generate valid CUID2 format', () => {
      const result = generateId('cuid2');

      expect(result).toMatch(/^[a-z0-9]{24}$/);
    });

    it('should generate unique CUID2s', () => {
      const cuid21 = generateId('cuid2');
      const cuid22 = generateId('cuid2');

      expect(cuid21).not.toBe(cuid22);
    });

    it('should be 24 characters long', () => {
      const cuid2 = generateId('cuid2');
      expect(cuid2).toHaveLength(24);
    });
  });

  describe('ULID', () => {
    it('should generate valid ULID format', () => {
      const result = generateId('ulid');

      expect(result).toMatch(/^[0-9A-Z]{26}$/);
    });

    it('should generate unique ULIDs', () => {
      const ulid1 = generateId('ulid');
      const ulid2 = generateId('ulid');

      expect(ulid1).not.toBe(ulid2);
    });

    it('should be 26 characters long', () => {
      const ulid = generateId('ulid');
      expect(ulid).toHaveLength(26);
    });

    it('should be sortable (first ULID should be less than second)', () => {
      const ulid1 = generateId('ulid');

      // Wait a bit to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // Wait for next millisecond
      }

      const ulid2 = generateId('ulid');

      expect(ulid1 < ulid2).toBe(true);
    });
  });

  describe('MongoDB ObjectId', () => {
    it('should generate valid ObjectId format', () => {
      const result = generateId('mongodbid');

      expect(result).toMatch(/^[0-9a-f]{24}$/i);
    });

    it('should generate unique ObjectIds', () => {
      const id1 = generateId('mongodbid');
      const id2 = generateId('mongodbid');

      expect(id1).not.toBe(id2);
    });

    it('should be 24 characters long', () => {
      const objectId = generateId('mongodbid');
      expect(objectId).toHaveLength(24);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid generator type', () => {
      expect(() => generateId('invalid-type' as any)).toThrow();
    });

    it('should throw error for empty generator type', () => {
      expect(() => generateId('' as any)).toThrow();
    });

    it('should throw error for undefined generator type', () => {
      expect(() => generateId(undefined as any)).toThrow();
    });
  });

  describe('Performance', () => {
    it('should generate multiple IDs quickly', () => {
      const start = Date.now();

      for (let index = 0; index < 1000; index++) {
        generateId('uuid-v4');
      }

      const end = Date.now();
      const duration = end - start;

      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should generate different types quickly', () => {
      const generators = [
        'uuid-v4',
        'nanoid',
        'cuid',
        'cuid2',
        'ulid',
        'mongodbid',
      ];

      const start = Date.now();

      for (const type of generators) {
        generateId(type);
      }

      const end = Date.now();
      const duration = end - start;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive calls', () => {
      const results = [];

      for (let index = 0; index < 100; index++) {
        results.push(generateId('uuid-v4'));
      }

      // All should be unique
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(100);
    });

    it('should handle mixed generator types', () => {
      const generators = [
        'uuid-v4',
        'nanoid',
        'cuid',
        'cuid2',
        'ulid',
        'mongodbid',
      ];
      const results = [];

      for (const type of generators) {
        results.push(generateId(type));
      }

      // All should be unique
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(generators.length);
    });
  });
});
