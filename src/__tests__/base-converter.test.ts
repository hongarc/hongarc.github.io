import { describe, expect, it } from 'vitest';

import { convertBase } from '@/domain/math/base';
import { baseConverter } from '@/plugins/math/base-converter';

describe('convertBase', () => {
  it('converts a 64-bit hex mask without losing precision', () => {
    const result = convertBase('FFFFFFFFFFFFFFFF', 'hex');
    expect(result).toMatchObject({
      decimal: '18446744073709551615',
      hex: '0xFF FF FF FF FF FF FF FF',
    });
  });

  it('converts decimals above 2^53 exactly', () => {
    const result = convertBase('9007199254740993', 'decimal');
    expect(result).toMatchObject({
      decimal: '9007199254740993',
      hex: '0x20 00 00 00 00 00 01',
    });
  });

  it('accepts its own space-grouped binary output', () => {
    const result = convertBase('0b1111 1111', 'binary');
    expect(result).toMatchObject({ decimal: '255', hex: '0xFF' });
  });

  it('ignores underscores between digits', () => {
    const result = convertBase('1_000_000', 'decimal');
    expect(result).toMatchObject({ decimal: '1000000', hex: '0x0F 42 40' });
  });

  it('keeps small decimals unchanged', () => {
    expect(convertBase('255', 'decimal')).toEqual({
      binary: '0b1111 1111',
      octal: '0o377',
      decimal: '255',
      hex: '0xFF',
    });
  });

  it('accepts its own spaced hex output and 0x/0o prefixes', () => {
    expect(convertBase('0xFF FF', 'hex')).toMatchObject({ decimal: '65535' });
    expect(convertBase('0Xff', 'hex')).toMatchObject({ decimal: '255' });
    expect(convertBase('0o777', 'octal')).toMatchObject({ decimal: '511' });
  });

  it('treats 0b inside a hex number as digits, not a prefix', () => {
    expect(convertBase('0b1', 'hex')).toMatchObject({ decimal: '177' });
  });

  it('pads zero like before', () => {
    expect(convertBase('0', 'decimal')).toEqual({
      binary: '0b0000',
      octal: '0o0',
      decimal: '0',
      hex: '0x00',
    });
  });

  it('rejects invalid digits', () => {
    expect(convertBase('12G', 'hex')).toEqual({ error: 'Invalid hex number' });
    expect(convertBase('102', 'binary')).toEqual({ error: 'Invalid binary number' });
    expect(convertBase('0xFF', 'decimal')).toEqual({ error: 'Invalid decimal number' });
  });

  it('rejects a prefix or separators with no digits', () => {
    expect(convertBase('0x', 'hex')).toEqual({ error: 'Invalid number' });
    expect(convertBase(' _ ', 'decimal')).toEqual({ error: 'Invalid number' });
  });

  it('refuses negative numbers', () => {
    expect(convertBase('-5', 'decimal')).toEqual({ error: 'Negative numbers are not supported' });
  });
});

describe('base converter plugin', () => {
  it('shows exact results for large inputs', async () => {
    const result = await baseConverter.transformer({
      input: 'FFFFFFFFFFFFFFFF',
      fromBase: 'hex',
    });
    expect(result.success).toBe(true);
    expect(result.output).toContain('Decimal: 18446744073709551615');
  });

  it('asks for input when empty', async () => {
    const result = await baseConverter.transformer({ input: '  ', fromBase: 'decimal' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a number to convert');
  });

  it('surfaces domain errors', async () => {
    const result = await baseConverter.transformer({ input: '12G', fromBase: 'hex' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid hex number');
  });
});
