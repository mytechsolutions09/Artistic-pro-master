import type { Metadata } from 'next';
import CategoriesPage from '@/src/page-components/CategoriesPage';

import { createStaticClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Art Categories & Collections - Browse Wall Prints | Lurevi',
  description: 'Explore curated art categories at Lurevi. Find the perfect digital art prints, abstract designs, landscape paintings, and contemporary wall decor for your home.',
  alternates: { canonical: 'https://lurevi.in/categories' },
};

export const revalidate = 3600;

export default async function Page() {
  const supabase = createStaticClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Art Categories — Explore Digital Art and Prints by Style
      </h1>
      <CategoriesPage initialCategories={categories || []} />
    </>
  );
}

