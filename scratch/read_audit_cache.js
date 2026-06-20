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

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase keys.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScores() {
  const targets = ['/help-center', '/categories/digital-art-prints', '/about-us'];
  for (const t of targets) {
    const { data, error } = await supabase
      .from('seo_scores')
      .select('*')
      .eq('path', t)
      .single();
      
    console.log(`\n=== Database Row for ${t} ===`);
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

checkScores();
