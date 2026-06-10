const { createClient } = require('@supabase/supabase-js');

const url = 'https://varduayfdqivaofymfov.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';

const adminSupabase = createClient(url, serviceKey);

async function linkPhone() {
  const realUserId = '44568eec-7547-47cb-bcef-b8d615d7fbc7';
  const phone = '+919999912873'; // Add plus sign
  
  console.log("Linking phone to real user...");
  const { error } = await adminSupabase.auth.admin.updateUserById(realUserId, { phone: phone, phone_confirm: true });
  
  if (error) {
    console.log("Error linking phone:", error);
  } else {
    console.log("Successfully linked phone to top-level column in Supabase!");
  }
}

linkPhone();
