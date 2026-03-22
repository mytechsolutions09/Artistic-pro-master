'use client';

/**
 * ClientShell wraps providers and global UI chrome.
 * It is a client component, but is rendered through the normal App Router
 * boundary so server-rendered page content remains visible to crawlers.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Providers from './providers';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import BottomTabs from '@/src/components/BottomTabs';
import PromoBar from '@/src/components/PromoBar';

/**
 * White shell for home, product detail, and dynamic category pages (`/[categorySlug]`).
 * Gray-50 for static app routes (browse, cart, admin, etc.).
 */
function shellBackgroundClass(pathname: string): string {
  if (pathname === '/') return 'bg-[#ffffff]';
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 2) {
    const notProductTwoSegment = new Set(['blog', 'admin', 'download']);
    if (notProductTwoSegment.has(parts[0])) return 'bg-gray-50';
    return 'bg-[#ffffff]';
  }

  if (parts.length === 1) {
    const reservedTopLevel = new Set([
      'admin',
      'blog',
      'browse',
      'cart',
      'categories',
      'checkout',
      'clothes',
      'contact-us',
      'dashboard',
      'faq',
      'favorites',
      'fb',
      'forgot-password',
      'gifts',
      'help-center',
      'normal',
      'payment-failed',
      'payment-success',
      'privacy',
      'reset-password',
      'returns-and-refunds',
      'search',
      'shipping-info',
      'shop',
      'sign-in',
      'sign-up',
      'about-us',
      'terms-and-conditions',
    ]);
    if (reservedTopLevel.has(parts[0])) return 'bg-gray-50';
    return 'bg-[#ffffff]';
  }

  return 'bg-gray-50';
}

const HIDE_HEADER_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
const HIDE_FOOTER_PATHS = [
  '/dashboard',
  '/about-us',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isAdmin = pathname.startsWith('/admin');
  const shouldHideHeader = HIDE_HEADER_PATHS.includes(pathname);
  const shouldHideFooter = isAdmin || HIDE_FOOTER_PATHS.includes(pathname);

  return (
    <Providers>
      <div className={`min-h-screen pb-20 lg:pb-0 ${shellBackgroundClass(pathname)}`}>
        <PromoBar />
        {!shouldHideHeader && <Header />}
        <BottomTabs />
        {children}
        {!shouldHideFooter && <Footer />}
      </div>
    </Providers>
  );
}
