import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export default async function Page({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  redirect(`/categories/${categorySlug}/${productSlug}`);
}
