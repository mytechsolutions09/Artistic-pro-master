import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Blog listing was sometimes served from CDN/browser cache with stale cover URLs
 * while article pages looked correct. Disable caching for /blog routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch');
    return res;
  }
  return NextResponse.next();
}

export const config = {
  // Match /blog and /blog/any-slug (listing + posts)
  matcher: ['/blog', '/blog/:path*'],
};
