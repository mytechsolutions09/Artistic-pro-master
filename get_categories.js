const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  if (parts.length >= 2) acc[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

supabase.from('categories').select('slug').then(res => {
  if (res.data) {
    res.data.forEach(c => console.log('https://lurevi.in/categories/' + c.slug));
  } else {
    console.log("No categories found or error:", res.error);
  }
});
