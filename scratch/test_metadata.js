const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const generateSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function test() {
  const { data: products, error } = await supabase
    .from('products')
    .select('title, description, price, images, meta_description');
    
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log('Total products:', products.length);
  const productSlug = 'crimson-lionel-messi-legacy';
  const found = products.find(p => generateSlug(p.title) === productSlug);
  console.log('Found product:', found);
  if (products.length > 0) {
    console.log('Sample product titles & slugs:');
    products.slice(0, 5).forEach(p => {
      console.log(`- "${p.title}" -> "${generateSlug(p.title)}"`);
    });
  }
}

test();
