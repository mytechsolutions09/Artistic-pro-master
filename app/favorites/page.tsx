import type { Metadata } from 'next';
import FavoritesPage from '@/src/page-components/FavoritesPage';

export const metadata: Metadata = {
  title: 'Favorites | Lurevi',
  description: 'Your favorite artworks.',
};

export default function Page() {
  return <FavoritesPage />;
}

