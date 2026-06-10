const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://varduayfdqivaofymfov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) return console.error(error);
  
  users.forEach(u => {
    console.log(`User: ${u.id}`);
    console.log(`  email: ${u.email}`);
    console.log(`  phone: ${u.phone}`);
    console.log(`  user_metadata:`, u.user_metadata);
  });
}

runTest();
