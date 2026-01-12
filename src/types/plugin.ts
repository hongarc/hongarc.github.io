import type { ReactNode } from 'react';

/**
 * Categories for grouping tools in the sidebar
 */
export type Category =
  | 'text'
  | 'format'
  | 'encoding'
  | 'crypto'
  | 'dev'
  | 'network'
  | 'math'
  | 'security';

export const CATEGORY_LABELS: Record<Category, string> = {
  text: 'Text & String',
  format: 'Formatters',
  encoding: 'Encoding',
  crypto: 'Crypto & Hash',
  dev: 'Development',
  network: 'Network & API',
  math: 'Math & Numbers',
  security: 'Security',
};

export const CATEGORY_ORDER: Category[] = [
  'text',
  'format',
  'encoding',
  'crypto',
  'dev',
  'network',
  'math',
  'security',
];

/**
 * Input field types supported by the dynamic form renderer
 */
export type InputType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file';

/**
 * Configuration for a single input field
 */
export interface InputConfig {
  /** Unique identifier for this input */
  id: string;
  /** Display label */
  label: string;
  /** Input type */
  type: InputType;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string | number | boolean;
  /** Whether this input is required */
  required?: boolean;
  /** Options for select inputs */
  options?: { value: string; label: string }[];
  /** Help text shown below the input */
  helpText?: string;
  /** Validation pattern (regex string) */
  pattern?: string;
  /** Min value for number inputs */
  min?: number;
  /** Max value for number inputs */
  max?: number;
  /** Number of rows for textarea */
  rows?: number;
  /** Accepted file types for file inputs */
  accept?: string;
  /** Group name for side-by-side layout - inputs with same group render in a row */
  group?: string;
  /** Condition for when this input should be visible */
  visibleWhen?: { inputId: string; value: string | string[] };
  /** Whether select input should be searchable/filterable */
  searchable?: boolean;
}

/**
 * Result of a transformer execution
 */
export interface TransformResult {
  /** Whether the transformation succeeded */
  success: boolean;
  /** The transformed output (if successful) */
  output?: string;
  /** Error message (if failed) */
  error?: string;
  /** Optional metadata about the transformation */
  meta?: Record<string, unknown>;
}

/**
 * Transformer function type - takes input values and returns a result
 */
export type TransformerFn = (inputs: Record<string, unknown>) => TransformResult;

/**
 * Async transformer for operations that need to be async (e.g., file reading)
 */
export type AsyncTransformerFn = (inputs: Record<string, unknown>) => Promise<TransformResult>;

/**
 * Core plugin interface - every tool must implement this
 */
export interface ToolPlugin {
  /** Unique URL-friendly identifier (e.g., 'json-formatter') */
  id: string;
  /** Display name shown in UI */
  label: string;
  /** Short description of what the tool does */
  description: string;
  /** Category for sidebar grouping */
  category: Category;
  /** Icon component from lucide-react */
  icon: ReactNode;
  /** Array of input configurations */
  inputs: InputConfig[];
  /** The transformer function (Ramda pipeline) */
  transformer: TransformerFn | AsyncTransformerFn;
  /** Whether the transformer is async */
  isAsync?: boolean;
  /** Whether the tool should always start with a fresh result (skip pre-rendered result) */
  preferFresh?: boolean;
  /** Keywords for search */
  keywords?: string[];
}

/**
 * Plugin module type for dynamic imports
 */
export interface PluginModule {
  default: ToolPlugin;
}

/**
 * Grouped plugins by category
 */
export type GroupedPlugins = Partial<Record<Category, ToolPlugin[]>>;
