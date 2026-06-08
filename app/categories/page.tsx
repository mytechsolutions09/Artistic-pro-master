import type { Metadata } from 'next';
import CategoriesPage from '@/src/page-components/CategoriesPage';

import { createStaticClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Art Categories | Lurevi',
  description: 'Explore all art categories at Lurevi.',
  alternates: { canonical: 'https://lurevi.in/categories' },
};

export const revalidate = 3600;

export default async function Page() {
  const supabase = createStaticClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return <CategoriesPage initialCategories={categories || []} />;
}

