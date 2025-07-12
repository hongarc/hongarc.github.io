import {
  generateUuidV4,
  generateUuidV1,
  generateNanoId,
  generateCuid,
  generateUlid,
  generateHexId,
  generateId,
  getAvailableIdTypes,
  idGeneratorExamples
} from '../idGenerators';

describe('idGenerators', () => {
  describe('generateUuidV4', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUuidV4();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUuidV4();
      const uuid2 = generateUuidV4();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateUuidV1', () => {
    it('should generate a valid UUID v1', () => {
      const uuid = generateUuidV1();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUuidV1();
      const uuid2 = generateUuidV1();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateNanoId', () => {
    it('should generate a NanoID with default length', () => {
      const nanoId = generateNanoId();
      expect(nanoId).toHaveLength(21);
      expect(nanoId).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate a NanoID with custom length', () => {
      const nanoId = generateNanoId(10);
      expect(nanoId).toHaveLength(10);
      expect(nanoId).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate unique NanoIDs', () => {
      const id1 = generateNanoId();
      const id2 = generateNanoId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateCuid', () => {
    it('should generate a valid CUID', () => {
      const cuid = generateCuid();
      expect(cuid).toMatch(/^c[a-z0-9]+$/);
    });

    it('should generate unique CUIDs', () => {
      const cuid1 = generateCuid();
      const cuid2 = generateCuid();
      expect(cuid1).not.toBe(cuid2);
    });
  });

  describe('generateUlid', () => {
    it('should generate a valid ULID', () => {
      const ulid = generateUlid();
      expect(ulid).toMatch(/^[0-9A-Z]+$/);
    });

    it('should generate unique ULIDs', () => {
      const ulid1 = generateUlid();
      const ulid2 = generateUlid();
      expect(ulid1).not.toBe(ulid2);
    });
  });

  describe('generateHexId', () => {
    it('should generate a HEX ID with default length', () => {
      const hexId = generateHexId();
      expect(hexId).toHaveLength(32);
      expect(hexId).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate a HEX ID with custom length', () => {
      const hexId = generateHexId(16);
      expect(hexId).toHaveLength(16);
      expect(hexId).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique HEX IDs', () => {
      const id1 = generateHexId();
      const id2 = generateHexId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateId', () => {
    it('should generate UUID v4 by default', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate UUID v1', () => {
      const id = generateId('uuidv1');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate NanoID', () => {
      const id = generateId('nanoid', { length: 10 });
      expect(id).toHaveLength(10);
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate CUID', () => {
      const id = generateId('cuid');
      expect(id).toMatch(/^c[a-z0-9]+$/);
    });

    it('should generate ULID', () => {
      const id = generateId('ulid');
      expect(id).toMatch(/^[0-9A-Z]+$/);
    });

    it('should generate HEX ID', () => {
      const id = generateId('hex', { length: 16 });
      expect(id).toHaveLength(16);
      expect(id).toMatch(/^[0-9a-f]+$/);
    });

    it('should throw error for unsupported type', () => {
      expect(() => generateId('invalid')).toThrow('Unsupported ID type: invalid');
    });
  });

  describe('getAvailableIdTypes', () => {
    it('should return all available ID types', () => {
      const types = getAvailableIdTypes();
      expect(types).toHaveLength(6);

      const typeNames = types.map(t => t.name);
      expect(typeNames).toContain('UUID v4');
      expect(typeNames).toContain('UUID v1');
      expect(typeNames).toContain('NanoID');
      expect(typeNames).toContain('CUID');
      expect(typeNames).toContain('ULID');
      expect(typeNames).toContain('HEX');
    });

    it('should have valid descriptions', () => {
      const types = getAvailableIdTypes();
      types.forEach(type => {
        expect(type.description).toBeTruthy();
        expect(typeof type.description).toBe('string');
      });
    });

    it('should have working generate functions', () => {
      const types = getAvailableIdTypes();
      types.forEach(type => {
        const id = type.generate();
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');
      });
    });
  });

  describe('examples', () => {
    it('should have valid UUID example', () => {
      const example = idGeneratorExamples.uuid;
      expect(example.input).toBe('uuid');
      expect(example.output).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(example.description).toBe('Generate UUID v4');
    });

    it('should have valid NanoID example', () => {
      const example = idGeneratorExamples.nanoid;
      expect(example.input).toBe('nanoid');
      expect(example.output).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(example.description).toBe('Generate NanoID (21 chars)');
    });

    it('should have valid CUID example', () => {
      const example = idGeneratorExamples.cuid;
      expect(example.input).toBe('cuid');
      expect(example.output).toMatch(/^c[a-z0-9]{24}$/);
      expect(example.description).toBe('Generate CUID');
    });

    it('should have valid ULID example', () => {
      const example = idGeneratorExamples.ulid;
      expect(example.input).toBe('ulid');
      expect(example.output).toHaveLength(26);
      expect(example.output).toMatch(/^[0-9A-Z]{26}$/);
      expect(example.description).toBe('Generate ULID');
    });

    it('should have valid HEX example', () => {
      const example = idGeneratorExamples.hex;
      expect(example.input).toBe('hex');
      expect(example.output).toHaveLength(32);
      expect(example.output).toMatch(/^[0-9a-f]+$/);
      expect(example.description).toBe('Generate 32-character HEX ID');
    });
  });
});