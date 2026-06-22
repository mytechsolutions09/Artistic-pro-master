import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    // 1. Trigger Next.js revalidation for the sitemap routes
    revalidatePath('/sitemap.xml');
    revalidatePath('/sitemap');

    // 2. Fetch the sitemap from the origin to force immediate regeneration
    const url = new URL(request.url);
    const origin = url.origin; // e.g. http://localhost:3000 or https://lurevi.in
    const sitemapUrl = `${origin}/sitemap.xml`;

    const res = await fetch(sitemapUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap: ${res.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Sitemap updated and revalidated successfully.',
      origin,
    });
  } catch (error: any) {
    console.error('Error updating sitemap:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while updating sitemap.' },
      { status: 500 }
    );
  }
}
