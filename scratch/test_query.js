const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testQuery() {
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'luxury-wall-art');
  
  console.log('Category query data:', catData);
  if (catError) console.error('Category error:', catError);

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .select('id, title, categories, images')
    .eq('status', 'active')
    .contains('categories', ['Luxury Wall Art']);

  console.log('Products found:', prodData ? prodData.length : 0);
  if (prodData && prodData.length > 0) {
    console.log('First product categories:', prodData[0].categories);
    console.log('First product images:', prodData[0].images);
  }
  if (prodError) console.error('Products error:', prodError);
}

testQuery();
