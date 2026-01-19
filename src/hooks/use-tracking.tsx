import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { trackCopyOutput } from '@/lib/analytics';

interface TrackingContextValue {
  toolId: string | null;
  trackCopy: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function -- Default no-op for context
const noop = () => {};

const TrackingContext = createContext<TrackingContextValue>({
  toolId: null,
  trackCopy: noop,
});

interface TrackingProviderProps {
  toolId: string | null;
  children: ReactNode;
}

export function TrackingProvider({ toolId, children }: TrackingProviderProps) {
  const trackCopy = useCallback(() => {
    if (toolId) {
      trackCopyOutput(toolId);
    }
  }, [toolId]);

  const value = useMemo(() => ({ toolId, trackCopy }), [toolId, trackCopy]);

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking(): TrackingContextValue {
  return useContext(TrackingContext);
}
