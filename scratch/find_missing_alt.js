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

async function findMissingAlt() {
  const { data, error } = await supabase
    .from('seo_scores')
    .select('path, score, audit_data');
    
  if (error) {
    console.error('Database query error:', error.message);
    return;
  }
  
  console.log('=== Pages with missing alt tags or 1 image ===');
  for (const row of data) {
    if (row.audit_data && row.audit_data.images) {
      const img = row.audit_data.images;
      if (img.total > 0 && img.missingAlt > 0) {
        console.log(`Path: ${row.path} | Score: ${row.score} | Images: ${img.total} | Missing Alt: ${img.missingAlt} | Msg: ${img.message}`);
      }
    }
  }
}

findMissingAlt();
