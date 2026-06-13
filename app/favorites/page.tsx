import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FavoritesPage = dynamic(() => import('@/src/page-components/FavoritesPage'));

export const metadata: Metadata = {
  title: 'Favorites | Lurevi',
  description: 'Your favorite artworks.',
};

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Your Favorites — Saved Digital Art & Print Collections
      </h1>
      <FavoritesPage />
    </>
  );
}

