import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function escapeCSV(field: string | null | undefined): string {
  if (!field) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing on the server');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch products directly
    const [productsRes, normalItemsRes] = await Promise.all([
      supabase.from('products').select('*').order('created_date', { ascending: false }),
      supabase.from('normal_items').select('*').eq('status', 'active').order('created_at', { ascending: false })
    ]);

    const products = productsRes.data || [];
    const normalItems = normalItemsRes.data || [];

    // 2. Filter products (art only)
    const artProducts = products.filter((p: any) => {
      const category = (p.category || '').toLowerCase();
      const categories = (p.categories || []).map((c: string) => c.toLowerCase());
      const isFB = categories.some((c: string) => c.includes('f&b') || c.includes('food') || c.includes('beverage')) || category.includes('f&b');
      const isClothes = categories.some((c: string) => c.includes('clothes') || c.includes('clothing') || c.includes('men') || c.includes('women')) || category.includes('clothing');
      return !isFB && !isClothes;
    });

    // 3. Map to Pinterest CSV
    const csvRows = [];
    csvRows.push('id,item_group_id,title,description,link,image_link,price,availability,condition');
    
    artProducts.forEach((p: any) => {
      const id = p.id;
      const title = p.title;
      const description = p.description || p.title;
      
      const slug = p.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const categorySlug = p.category_slug || (p.categories && p.categories.length > 0 ? p.categories[0].toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'art');
      const link = `https://lurevi.in/categories/${categorySlug}/${slug}`;
      
      const image_link = p.main_image || (p.images && p.images[0]) || '';
      const price = `${p.price || 0} INR`;
      const availability = p.status === 'active' || p.in_stock !== false ? 'in stock' : 'out of stock';
      const condition = 'new';
      
      csvRows.push([
        escapeCSV(id),
        escapeCSV(id), // item_group_id same as id for simplicity, or omit
        escapeCSV(title),
        escapeCSV(description),
        escapeCSV(link),
        escapeCSV(image_link),
        escapeCSV(price),
        escapeCSV(availability),
        escapeCSV(condition)
      ].join(','));
    });

    normalItems.forEach((p: any) => {
      const id = p.id;
      const title = p.title;
      const description = p.description || p.title;
      
      const slug = p.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const link = `https://lurevi.in/shop/${slug}`;
      
      const image_link = p.main_image || (p.images && p.images[0]) || '';
      const price = `${p.price || 0} INR`;
      const availability = p.status === 'active' || p.in_stock !== false ? 'in stock' : 'out of stock';
      const condition = 'new';
      
      csvRows.push([
        escapeCSV(id),
        escapeCSV(id),
        escapeCSV(title),
        escapeCSV(description),
        escapeCSV(link),
        escapeCSV(image_link),
        escapeCSV(price),
        escapeCSV(availability),
        escapeCSV(condition)
      ].join(','));
    });

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pinterest_catalog.csv"',
      },
    });
  } catch (error: any) {
    console.error('Error generating Pinterest catalog:', error);
    return new NextResponse('Internal Server Error: ' + (error.message || String(error)), { status: 500 });
  }
}
