import { permanentRedirect } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: products } = await supabase
    .from('products')
    .select('title, categories')
    .eq('status', 'active');

  const params: Array<{ categorySlug: string; productSlug: string }> = [];

  for (const product of products || []) {
    if (!product.title || !Array.isArray(product.categories) || product.categories.length === 0) {
      continue;
    }
    const categorySlug = generateSlug(product.categories[0]);
    const productSlug = generateSlug(product.title);
    params.push({
      categorySlug,
      productSlug,
    });
  }

  return params;
}

export default async function Page({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  permanentRedirect(`/categories/${categorySlug}/${productSlug}`);
}

