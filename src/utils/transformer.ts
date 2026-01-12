import type { ToolPlugin, TransformResult } from '@/types/plugin';

/**
 * Create a successful transform result
 */
export const success = (output: string, meta?: Record<string, unknown>): TransformResult => {
  const result: TransformResult = {
    success: true,
    output,
  };
  if (meta) {
    result.meta = meta;
  }
  return result;
};

/**
 * Create a failed transform result
 */
export const failure = (error: string): TransformResult => ({
  success: false,
  error,
});

/**
 * Create a result that shows an instruction (e.g., when input is empty)
 */
export const instruction = (message: string): TransformResult => ({
  success: false,
  instruction: message,
});

/**
 * Execute a plugin's transformer with the given inputs
 */
export const executeTransformer = async (
  plugin: ToolPlugin,
  inputs: Record<string, unknown>
): Promise<TransformResult> => {
  try {
    if (plugin.isAsync) {
      return await plugin.transformer(inputs);
    }
    return plugin.transformer(inputs) as TransformResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return failure(message);
  }
};
