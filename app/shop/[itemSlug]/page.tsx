import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import NormalItemsPage from '@/src/page-components/NormalItemsPage';

interface Props {
  params: Promise<{ itemSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemSlug } = await params;
  const supabase = await createClient();

  // Prefer matching by stored slug; if it fails we fall back to a generic title.
  const { data: item } = await supabase
    .from('normal_items')
    .select('title')
    .eq('slug', itemSlug)
    .single();

  const title = item ? `${item.title} | Lurevi` : 'Product | Lurevi';

  return {
    title,
    alternates: {
      canonical: `https://lurevi.in/shop/${itemSlug}`,
      languages: {
        'en-IN': `https://lurevi.in/shop/${itemSlug}`,
        'x-default': `https://lurevi.in/shop/${itemSlug}`,
      },
    },
  };
}

export const revalidate = 3600;

export default function Page() {
  return <NormalItemsPage />;
}

