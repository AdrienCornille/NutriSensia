'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that syncs state-based view navigation with browser history.
 *
 * - Back: when the user presses browser back from a child view, `onBack` is called.
 * - Forward: when the user presses browser forward, `onForward` is called with the
 *   view name so the component can restore its state.
 * - In-app back buttons should call `goBack()` instead of setting state directly.
 *
 * @param view       Current view identifier
 * @param rootView   The "home" view (e.g. 'list')
 * @param onBack     Callback to reset state to root view
 * @param onForward  Callback to restore a child view after browser forward
 */
export function useViewHistory<T extends string>(
  view: T,
  rootView: T,
  onBack: () => void,
  onForward?: (view: T) => void,
) {
  const isChildView = view !== rootView;
  // Track whether the current view change was caused by popstate (browser back/forward)
  const isPopStateNav = useRef(false);
  // Track if we've already pushed for the current child view
  const pushedForView = useRef<T | null>(null);

  // Push history entry when entering a child view (only via user action, not popstate)
  useEffect(() => {
    if (isChildView && !isPopStateNav.current && pushedForView.current !== view) {
      window.history.pushState({ _vh: view }, '');
      pushedForView.current = view;
    }
    isPopStateNav.current = false;
  }, [view, isChildView]);

  // Reset tracking when returning to root
  useEffect(() => {
    if (!isChildView) {
      pushedForView.current = null;
    }
  }, [isChildView]);

  // Listen for browser back & forward buttons
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const state = event.state;

      if (state?._vh && onForward) {
        // Forward navigation — restore child view
        isPopStateNav.current = true;
        pushedForView.current = state._vh as T;
        onForward(state._vh as T);
      } else if (pushedForView.current !== null) {
        // Back navigation — return to root
        isPopStateNav.current = true;
        pushedForView.current = null;
        onBack();
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack, onForward]);

  // goBack: for in-app back buttons — triggers history.back() which fires popstate
  const goBack = useCallback(() => {
    if (isChildView) {
      window.history.back();
    }
  }, [isChildView]);

  return { goBack };
}
