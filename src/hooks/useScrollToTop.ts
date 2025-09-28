import { useEffect } from 'react';

// No-op: rely on browser defaults (including built-in history scroll restoration)
export const useScrollToTop = () => {
  // Deprecated: kept for compatibility. Global behavior handled by useScrollRestoration.
  useEffect(() => {}, []);
};

// Global scroll restoration: forward nav -> top; back/forward -> previous position
export const useScrollRestoration = () => {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const positions = new Map<string, number>();
    let isPop = false;

    const onPopState = () => { isPop = true; };
    window.addEventListener('popstate', onPopState);

    const save = () => { positions.set(locationKey(), window.scrollY); };
    const locationKey = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

    // Save before unload and on navigation triggers
    window.addEventListener('beforeunload', save);

    const restoreOrTop = () => {
      const key = locationKey();
      if (isPop && positions.has(key)) {
        const y = positions.get(key) || 0;
        requestAnimationFrame(() => window.scrollTo({ top: y, left: 0, behavior: 'auto' }));
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      isPop = false;
    };

    // Initial
    restoreOrTop();

    // Observe DOM changes briefly to ensure accurate restore after heavy renders
    const mo = new MutationObserver(() => {
      if (isPop) restoreOrTop();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('beforeunload', save);
      mo.disconnect();
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);
};
