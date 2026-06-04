'use client';

/**
 * Drop-in compatibility shim: react-router-dom → next/navigation
 *
 * Replace every import in existing components:
 *   import { Link, useNavigate, useLocation, useParams } from '@/src/compat/router';
 * with:
 *   import { Link, useNavigate, useLocation, useParams } from '@/src/compat/router';
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useRouter,
  usePathname,
  useParams as nextUseParams,
  redirect,
} from 'next/navigation';
import NextLink from 'next/link';

// ─── Link ────────────────────────────────────────────────────────────────────
// react-router Link uses `to` prop; next/link uses `href`.
// This wrapper accepts both so existing code works unchanged.
type LinkProps = Omit<React.ComponentPropsWithoutRef<typeof NextLink>, 'href'> & {
  to?: string;
  href?: string;
  children?: React.ReactNode;
};

export const Link: React.FC<LinkProps> = ({ to, href, children, ...rest }) => (
  <NextLink href={(to ?? href ?? '/') as string} {...rest}>
    {children}
  </NextLink>
);

// ─── useNavigate ─────────────────────────────────────────────────────────────
// Returns a function matching react-router's navigate(to, options?) signature.
export function useNavigate() {
  const router = useRouter();
  return (
    to: string | number,
    options?: { replace?: boolean; state?: unknown }
  ) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

// ─── useLocation ─────────────────────────────────────────────────────────────
// Returns a react-router-compatible location object.
export function useLocation() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateSearch = () => setSearch(window.location.search || '');
    updateSearch();
    window.addEventListener('popstate', updateSearch);
    return () => window.removeEventListener('popstate', updateSearch);
  }, [pathname]);
  return {
    pathname: pathname ?? '/',
    search,
    hash: '',
    state: null,
    key: 'default',
  };
}

// ─── useParams ───────────────────────────────────────────────────────────────
// Next.js useParams already has the same API shape.
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return nextUseParams() as T;
}

// ─── Navigate (component) ────────────────────────────────────────────────────
// Imperative redirect component used in some route guards.
export function Navigate({ to, replace: _replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (_replace) router.replace(to);
    else router.push(to);
  }, [router, to, _replace]);
  return null;
}

// ─── useSearchParams ─────────────────────────────────────────────────────────
// react-router-compatible tuple API:
//   const [params, setParams] = useSearchParams();
// This implementation avoids next/navigation's useSearchParams hook so static
// prerendering does not fail for pages using the compatibility layer.
type SearchParamsInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

function toUrlSearchParams(input: SearchParamsInput): URLSearchParams {
  if (typeof input === 'string') return new URLSearchParams(input);
  if (input instanceof URLSearchParams) return new URLSearchParams(input.toString());
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });
  return params;
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [searchState, setSearchState] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateSearch = () => setSearchState(window.location.search || '');
    updateSearch();
    window.addEventListener('popstate', updateSearch);
    return () => window.removeEventListener('popstate', updateSearch);
  }, [pathname]);

  const params = useMemo(() => {
    const raw = searchState.startsWith('?') ? searchState.slice(1) : searchState;
    return new URLSearchParams(raw);
  }, [searchState]);

  const setSearchParams = useCallback(
    (
      next: SearchParamsInput | ((prev: URLSearchParams) => SearchParamsInput),
      options?: { replace?: boolean }
    ) => {
      const base = new URLSearchParams(params.toString());
      const resolved = typeof next === 'function' ? next(base) : next;
      const nextParams = toUrlSearchParams(resolved);
      const query = nextParams.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      setSearchState(query ? `?${query}` : '');
      if (options?.replace) router.replace(nextUrl);
      else router.push(nextUrl);
    },
    [params, pathname, router]
  );

  return [params, setSearchParams] as const;
}

// ─── BrowserRouter / Routes / Route ──────────────────────────────────────────
// These are only in src/App.tsx which is no longer used by Next.js routing.
// Providing empty stubs prevents TypeScript errors in that dead-code file.
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function Route(_props: {
  path?: string;
  element?: React.ReactNode;
  index?: boolean;
}) {
  return null;
}

// ─── Re-exports that have identical APIs ─────────────────────────────────────
export { redirect };
export { NextLink };



