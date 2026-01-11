/**
 * Input extraction utilities for plugin transformers
 * These helpers safely extract typed values from the inputs record
 */

/**
 * Get a string value from inputs
 */
export const getStringInput = (
  inputs: Record<string, unknown>,
  key: string,
  defaultValue = ''
): string => {
  const value = inputs[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return defaultValue;
};

/**
 * Get a trimmed string value from inputs
 */
export const getTrimmedInput = (
  inputs: Record<string, unknown>,
  key: string,
  defaultValue = ''
): string => {
  return getStringInput(inputs, key, defaultValue).trim();
};

/**
 * Get a number value from inputs
 */
export const getNumberInput = (
  inputs: Record<string, unknown>,
  key: string,
  defaultValue = 0
): number => {
  const value = inputs[key];
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return defaultValue;
};

/**
 * Get a boolean value from inputs
 */
export const getBooleanInput = (
  inputs: Record<string, unknown>,
  key: string,
  defaultValue = false
): boolean => {
  const value = inputs[key];
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

/**
 * Get a select option value from inputs
 */
export const getSelectInput = <T extends string>(
  inputs: Record<string, unknown>,
  key: string,
  validOptions: readonly T[],
  defaultValue: T
): T => {
  const value = inputs[key];
  if (typeof value === 'string' && validOptions.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
};

/**
 * Extract error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};
