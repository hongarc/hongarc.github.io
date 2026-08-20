import { describe, expect, it } from 'vitest';

import { uuidGenerator } from '@/plugins/text/uuid-generator';

const run = async (inputs: Record<string, unknown>) => uuidGenerator.transformer(inputs);

describe('uuid generator plugin', () => {
  it('generates exactly the requested number of identifiers', async () => {
    // Pins the argument order of the count/generator pair — reversing it would
    // silently produce the wrong number of lines.
    for (const count of [1, 3, 10]) {
      const result = await run({ type: 'uuidv4', count, uppercase: false, noDashes: false });
      expect(result.success).toBe(true);
      expect(result.output?.split('\n')).toHaveLength(count);
    }
  });

  it('produces distinct version 4 identifiers in canonical form', async () => {
    const result = await run({ type: 'uuidv4', count: 5, uppercase: false, noDashes: false });
    const ids = result.output?.split('\n') ?? [];

    expect(new Set(ids).size).toBe(5);
    for (const id of ids) {
      expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
    }
  });

  it('applies the uppercase option', async () => {
    const result = await run({ type: 'uuidv4', count: 2, uppercase: true, noDashes: false });
    const ids = result.output?.split('\n') ?? [];

    expect(ids).toHaveLength(2);
    for (const id of ids) {
      expect(id).toBe(id.toUpperCase());
      expect(id).toContain('-');
    }
  });

  it('applies the no-dashes option', async () => {
    const result = await run({ type: 'uuidv4', count: 2, uppercase: false, noDashes: true });
    const ids = result.output?.split('\n') ?? [];

    expect(ids).toHaveLength(2);
    for (const id of ids) {
      expect(id).not.toContain('-');
      expect(id).toHaveLength(32);
    }
  });

  it('supports the other identifier types', async () => {
    for (const type of ['uuidv7', 'cuid', 'mongodb']) {
      const result = await run({ type, count: 3, uppercase: false, noDashes: false });
      expect(result.success).toBe(true);
      expect(result.output?.split('\n')).toHaveLength(3);
    }
  });
});
