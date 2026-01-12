import type { TransformResult } from '@/types/plugin';

export interface OutputStrategyProps {
  result: TransformResult;
  meta: Record<string, unknown>;
}

export interface OutputStrategy {
  id: string;
  component: React.ComponentType<OutputStrategyProps>;
  // Predicate to determine if this strategy should handle the result
  shouldHandle: (result: TransformResult) => boolean;
}
