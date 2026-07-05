const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

// Load environment variables using Next.js built-in utility
loadEnvConfig(process.cwd());

function escapeCSV(field) {
  if (!field) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  console.log('Generating Pinterest catalog...');
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables missing. Skipping Pinterest catalog generation.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch products and normal items
    const [productsRes, normalItemsRes] = await Promise.all([
      supabase.from('products').select('*').order('created_date', { ascending: false }),
      supabase.from('normal_items').select('*').eq('status', 'active').order('created_at', { ascending: false })
    ]);

    if (productsRes.error) throw productsRes.error;
    if (normalItemsRes.error) throw normalItemsRes.error;

    const products = productsRes.data || [];
    const normalItems = normalItemsRes.data || [];

    // Filter products (art only)
    const artProducts = products.filter((p) => {
      const category = (p.category || '').toLowerCase();
      const categories = (p.categories || []).map((c) => c.toLowerCase());
      const isFB = categories.some((c) => c.includes('f&b') || c.includes('food') || c.includes('beverage')) || category.includes('f&b');
      const isClothes = categories.some((c) => c.includes('clothes') || c.includes('clothing') || c.includes('men') || c.includes('women')) || category.includes('clothing');
      return !isFB && !isClothes;
    });

    const csvRows = [];
    csvRows.push('id,item_group_id,title,description,link,image_link,price,availability,condition');

    artProducts.forEach((p) => {
      const id = p.id;
      const title = p.title;
      const description = p.description || p.title;
      
      const slug = p.slug || generateSlug(title);
      const categorySlug = p.category_slug || (p.categories && p.categories.length > 0 ? generateSlug(p.categories[0]) : 'art');
      const link = `https://lurevi.in/categories/${categorySlug}/${slug}`;
      
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

    normalItems.forEach((p) => {
      const id = p.id;
      const title = p.title;
      const description = p.description || p.title;
      
      const slug = p.slug || generateSlug(title);
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
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const outputPath = path.join(publicDir, 'pinterest-catalog.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    console.log(`✅ Pinterest catalog written successfully to ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate Pinterest catalog:', error);
  }
}

run();
