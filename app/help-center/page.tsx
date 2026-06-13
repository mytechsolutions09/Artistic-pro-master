import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const HelpCenter = dynamic(() => import('@/src/page-components/HelpCenter'));

export const metadata: Metadata = {
  title: 'Help Center | Lurevi',
  description: 'Get help with your Lurevi orders and account.',
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Lurevi Help Center — Support, Orders, and Account Management
      </h1>
      <HelpCenter />
    </>
  );
}

