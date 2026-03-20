'use client';

/**
 * Drop-in compatibility shim: react-router-dom → next/navigation
 *
 * Replace every import in existing components:
 *   import { Link, useNavigate, useLocation, useParams } from '@/src/compat/router';
 * with:
 *   import { Link, useNavigate, useLocation, useParams } from '@/src/compat/router';
 */

import React, { useEffect } from 'react';
import {
  useRouter,
  usePathname,
  useSearchParams,
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
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
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
// In react-router, useSearchParams returns [searchParams, setSearchParams].
// We export next/navigation's version directly — same interface for reads,
// but mutations require router.push() with new query string.
export { useSearchParams } from 'next/navigation';

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



