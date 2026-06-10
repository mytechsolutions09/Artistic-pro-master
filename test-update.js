const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://varduayfdqivaofymfov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Fetching users...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return console.error(listError);
  
  const userWithPhone = users.find(u => u.phone);
  if (!userWithPhone) return console.log("No user with phone found");
  
  console.log("Found user:", userWithPhone.id);
  const { data, error } = await supabase.auth.admin.updateUserById(userWithPhone.id, {
    password: 'testPassword123!A'
  });
  
  if (error) {
    console.error("Update error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success!");
  }
}

runTest();
