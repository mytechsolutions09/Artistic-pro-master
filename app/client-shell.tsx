'use client';

/**
 * ClientShell — loaded with ssr: false so it only mounts on the client.
 * This prevents any browser-API calls (localStorage, window, etc.) from
 * running during Next.js server-side rendering or static generation.
 *
 * It wraps the app with all context providers, then renders the layout shell
 * (Header, Footer, BottomTabs, PromoBar) conditionally by pathname.
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
