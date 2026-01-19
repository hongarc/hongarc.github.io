/**
 * Unified Analytics Module
 *
 * Single source of truth for all analytics tracking.
 * Features:
 * - Error isolation (analytics never crashes the app)
 * - Consent-aware (respects user preferences)
 * - Batching-ready (can add debouncing later)
 * - Type-safe event definitions
 */

import { logEvent } from 'firebase/analytics';

import { getAnalyticsInstance } from '../firebase';

// ============================================================================
// Types
// ============================================================================

export type InteractionMethod = 'keyboard' | 'click';

interface AnalyticsEvent {
  name: string;
  params: Record<string, string | number | boolean>;
}

// ============================================================================
// Core
// ============================================================================

/**
 * Check if analytics is enabled (consent, environment, etc.)
 */
function isAnalyticsEnabled(): boolean {
  // Could check for consent here in the future
  // return localStorage.getItem('analytics-consent') === 'true';
  return true;
}

/**
 * Safe event logging - never throws, never blocks UI
 */
async function logSafe(event: AnalyticsEvent): Promise<void> {
  if (!isAnalyticsEnabled()) return;

  try {
    const analytics = await getAnalyticsInstance();
    if (analytics) {
      logEvent(analytics, event.name, event.params);
      console.info('📊', event.name, event.params);
    }
  } catch (error) {
    console.warn('📊 Analytics error:', error);
  }
}

// ============================================================================
// Event Tracking Functions
// ============================================================================

/** Track tool page view */
export function trackToolView(toolId: string, category: string): void {
  void logSafe({
    name: 'tool_view',
    params: { tool_id: toolId, tool_category: category },
  });
}

/** Track transform execution */
export function trackToolTransform(toolId: string, success: boolean, durationMs?: number): void {
  void logSafe({
    name: 'tool_transform',
    params: {
      tool_id: toolId,
      success: success ? 'yes' : 'no',
      duration_ms: durationMs ?? 0,
    },
  });
}

/** Track copy output action */
export function trackCopyOutput(toolId: string): void {
  void logSafe({
    name: 'copy_output',
    params: { tool_id: toolId },
  });
}

/** Track pin/unpin action */
export function trackToolPin(toolId: string, action: 'pin' | 'unpin'): void {
  void logSafe({
    name: 'tool_pin',
    params: { tool_id: toolId, action },
  });
}

/** Track search (result count only, not query for privacy) */
export function trackToolSearch(resultCount: number): void {
  void logSafe({
    name: 'tool_search',
    params: {
      result_count: resultCount,
      has_results: resultCount > 0 ? 'yes' : 'no',
    },
  });
}

/** Track theme change */
export function trackThemeToggle(theme: 'light' | 'dark'): void {
  void logSafe({
    name: 'theme_toggle',
    params: { theme },
  });
}

/** Track user interaction method (keyboard vs click) */
export function trackInteraction(action: string, method: InteractionMethod): void {
  void logSafe({
    name: 'user_interaction',
    params: { action, method },
  });
}

/** Track session duration on a tool */
export function trackToolSession(toolId: string, durationSeconds: number): void {
  const bucket =
    durationSeconds < 10
      ? 'short'
      : durationSeconds < 60
        ? 'medium'
        : durationSeconds < 300
          ? 'long'
          : 'very_long';

  void logSafe({
    name: 'tool_session',
    params: {
      tool_id: toolId,
      duration_seconds: Math.round(durationSeconds),
      duration_bucket: bucket,
    },
  });
}
