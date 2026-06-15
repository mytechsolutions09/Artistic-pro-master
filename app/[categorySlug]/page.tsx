import { permanentRedirect } from 'next/navigation';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export default async function Page({ params }: Props) {
  const { categorySlug } = await params;
  permanentRedirect(`/categories/${categorySlug}`);
}

