import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ClothingProductPage from '@/src/page-components/ClothingProductPage';

interface Props {
  params: Promise<{ productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', productSlug)
    .single();
  return {
    title: data ? `${data.title} | Lurevi Clothing` : 'Clothing | Lurevi',
    description:
      data?.description?.replace(/<[^>]*>/g, '').substring(0, 200) ??
      'Shop clothing at Lurevi.',
  };
}

export const revalidate = 3600;

export default function Page() {
  return <ClothingProductPage />;
}
