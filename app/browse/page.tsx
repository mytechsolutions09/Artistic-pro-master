import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const BrowsePage = dynamic(() => import('@/src/page-components/BrowsePage'));

export const metadata: Metadata = {
  title: 'Shop Premium Digital Art & Wall Prints | Lurevi Collection',
  description: 'Browse 100+ curated digital art prints — illustration, abstract, wall art — delivered across India. Find your style at Lurevi.',
  alternates: { canonical: 'https://lurevi.in/browse' },
};

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Browse Art — Digital Art Prints & Premium Collections
      </h1>
      <BrowsePage />
    </>
  );
}

