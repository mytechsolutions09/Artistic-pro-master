import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FavoritesPage = dynamic(() => import('@/src/page-components/FavoritesPage'));

export const metadata: Metadata = {
  title: 'Favorites | Lurevi',
  description: 'Your favorite artworks.',
};

export default function Page() {
  return <FavoritesPage />;
}

