'use client';

import { useCallback, useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';

/**
 * Keeps a scrollable left nav’s vertical position when `deps` change (active tab, route, etc.).
 * Attach `navRef` and `onNavScroll` to the element that has overflow-y-auto.
 */
export function usePreserveNavScroll(deps: DependencyList): {
  navRef: RefObject<HTMLElement | null>;
  onNavScroll: () => void;
} {
  const navRef = useRef<HTMLElement | null>(null);
  const scrollTopRef = useRef(0);

  const onNavScroll = useCallback(() => {
    const el = navRef.current;
    if (el) scrollTopRef.current = el.scrollTop;
  }, []);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (el) el.scrollTop = scrollTopRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore position when these deps change
  }, deps);

  return { navRef, onNavScroll };
}
