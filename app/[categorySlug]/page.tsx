import { permanentRedirect } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  return (categories || []).map((category) => ({
    categorySlug: category.slug,
  }));
}

export default async function Page({ params }: Props) {
  const { categorySlug } = await params;
  permanentRedirect(`/categories/${categorySlug}`);
}

