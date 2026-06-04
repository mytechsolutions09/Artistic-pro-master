import type { Metadata } from 'next';
import SearchResults from '@/src/page-components/SearchResults';

export const metadata: Metadata = {
  title: 'Search | Lurevi',
  description: 'Search Lurevi.',
};

export default function Page() {
  return <SearchResults />;
}

