/**
 * Interaction Tracking via Event Delegation
 *
 * Instead of manually adding tracking to each component, use data attributes:
 *   <button data-track="toggle-sidebar">...</button>
 *
 * This hook listens at document level and automatically tracks interactions.
 */

import { useEffect } from 'react';

import { trackInteraction } from '@/lib/analytics';

/**
 * Hook to enable automatic interaction tracking via data-track attributes.
 *
 * Usage in components:
 *   <button data-track="toggle-sidebar">Toggle</button>
 *   <Link data-track="select-tool">Tool</Link>
 *
 * The value of data-track becomes the action name in analytics.
 */
export function useInteractionTracking(): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Find closest element with data-track attribute
      const trackable = target.closest('[data-track]');
      if (!trackable) return;

      const action = (trackable as HTMLElement).dataset.track;
      if (action) {
        trackInteraction(action, 'click');
      }
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);
}
