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
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <PromoBar />
        {!shouldHideHeader && <Header />}
        <BottomTabs />
        {children}
        {!shouldHideFooter && <Footer />}
      </div>
    </Providers>
  );
}
