import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SearchResults = dynamic(() => import('@/src/page-components/SearchResults'));

export const metadata: Metadata = {
  title: 'Search | Lurevi',
  description: 'Search Lurevi.',
};

export default function Page() {
  return <SearchResults />;
}

