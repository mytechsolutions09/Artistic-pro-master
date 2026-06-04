'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type LazyHomeSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Tailwind min-height classes for placeholder (layout stability). */
  minHeight?: string;
  /** IntersectionObserver rootMargin — load slightly before entering viewport. */
  rootMargin?: string;
  /** Fires once when the section is about to mount. */
  onVisible?: () => void;
};

/**
 * Mounts children only after the placeholder nears the viewport.
 * Reduces initial JS + layout work on the homepage.
 */
export default function LazyHomeSection({
  children,
  className = '',
  minHeight = 'min-h-[200px]',
  rootMargin = '280px 0px',
  onVisible,
}: LazyHomeSectionProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visibleFired = useRef(false);

  const fireVisible = useCallback(() => {
    if (visibleFired.current) return;
    visibleFired.current = true;
    onVisible?.();
  }, [onVisible]);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fireVisible();
          setMounted(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin, fireVisible]);

  return (
    <div ref={ref} className={className}>
      {mounted ? (
        children
      ) : (
        <div className={`${minHeight} w-full rounded-2xl bg-gray-100/70 animate-pulse`} aria-hidden />
      )}
    </div>
  );
}
