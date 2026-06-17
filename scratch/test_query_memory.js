const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testMemoryFilter() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, categories, images, status')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log('Total active products fetched:', products.length);
  
  const filtered = products.filter(p => {
    const categories = (p.categories || []).map(c => c.toLowerCase());
    return categories.includes('luxury wall art') || categories.includes('luxury-wall-art');
  });

  console.log('Luxury products found in memory:', filtered.length);
  if (filtered.length > 0) {
    console.log('First luxury product title:', filtered[0].title);
    console.log('First luxury product categories:', filtered[0].categories);
    console.log('First luxury product images:', filtered[0].images);
  }
}

testMemoryFilter();
