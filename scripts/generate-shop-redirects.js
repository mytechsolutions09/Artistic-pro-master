const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

// Load .env / .env.local so this script can run standalone or as part of the build
loadEnvConfig(process.cwd());

function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates Netlify _redirects rules for the retired /shop/[slug] route.
 *
 * Maps every active product from /shop/<item-slug> to its primary canonical URL.
 * Appends a catch-all fallback rule at the end.
 */
async function run() {
  console.log('Generating /shop/* -> canonical product Netlify redirects...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase env vars missing. Skipping shop redirects generation.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: products, error } = await supabase
    .from('products')
    .select('title, categories, gender')
    .eq('status', 'active');

  if (error) {
    console.error('❌ Error fetching products:', error.message);
  }

  const lines = [];
  const processedSlugs = new Set();

  for (const product of products || []) {
    if (!product?.title) continue;

    const itemSlug = generateSlug(product.title);
    if (!itemSlug || processedSlugs.has(itemSlug)) continue;
    processedSlugs.add(itemSlug);

    const isClothing = 
      (product.gender === 'Men' || product.gender === 'Women' || product.gender === 'Unisex') ||
      (Array.isArray(product.categories) && product.categories.some(cat => {
        const lowerCat = String(cat).toLowerCase();
        return lowerCat.includes('men') || 
               lowerCat.includes('women') || 
               lowerCat.includes('unisex') ||
               lowerCat.includes('clothing');
      }));

    const categoriesList = Array.isArray(product.categories) ? product.categories : [];
    const categoriesLower = categoriesList.map(c => String(c).toLowerCase()).join(' ');
    const isFB = categoriesLower.includes('food & beverage') || 
                 categoriesLower.includes('f&b') || 
                 categoriesLower.includes('food-beverage') ||
                 categoriesLower.includes('dry fruit') || 
                 categoriesLower.includes('dried fruit') || 
                 categoriesLower.includes('spice');

    let targetPath = '';
    if (isClothing) {
      targetPath = `/clothes/${itemSlug}`;
    } else if (isFB) {
      targetPath = `/${itemSlug}`;
    } else {
      const categorySlug = categoriesList[0];
      if (categorySlug) {
        const safeCategorySlug = generateSlug(String(categorySlug));
        targetPath = `/categories/${safeCategorySlug}/${itemSlug}`;
      } else {
        targetPath = `/categories/normal/${itemSlug}`;
      }
    }

    lines.push(`/shop/${itemSlug}  ${targetPath}  301`);
  }

  // Catch-all fallback at the end for unmapped items
  lines.push('/shop/:slug  /categories/normal/:slug  301');

  const section =
    [
      '# -------------------------------------------------------',
      '# AUTO-GENERATED — do not edit manually.',
      '# Source: scripts/generate-shop-redirects.js',
      `# Explicit rules: ${processedSlugs.size} active product(s) mapped`,
      '# -------------------------------------------------------',
      ...lines,
      '# --- END AUTO-GENERATED ---',
    ].join('\n') + '\n';

  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const redirectsPath = path.join(publicDir, '_redirects');

  let base = '';
  if (fs.existsSync(redirectsPath)) {
    const existing = fs.readFileSync(redirectsPath, 'utf-8');
    base = existing
      .replace(
        /# -------+\n# AUTO-GENERATED.*?# --- END AUTO-GENERATED ---\n?/gs,
        ''
      )
      .trimEnd();
    if (base.length > 0) base += '\n\n';
  }

  fs.writeFileSync(redirectsPath, base + section, 'utf-8');
  const stats = fs.statSync(redirectsPath);

  console.log(
    `✅ Shop redirects written to public/_redirects: ${lines.length} rules (${processedSlugs.size} explicit + 1 catch-all). Size: ${(stats.size / 1024).toFixed(2)} KB`
  );
}

run().catch((err) => {
  console.error('❌ Shop redirect generation failed:', err.message || err);
});
