import type { AppProps } from 'next/app';
import Providers from '@/app/providers';

/**
 * Pages Router (`src/pages/*`) is outside `app/layout.tsx`. Wrap with the same
 * providers as App Router so `useAuth` and other context hooks work during SSG/SSR.
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
