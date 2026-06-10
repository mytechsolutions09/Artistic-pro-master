const { createClient } = require('@supabase/supabase-js');

const url = 'https://varduayfdqivaofymfov.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';

const adminSupabase = createClient(url, serviceKey);

async function resetPassword() {
  const email = 'arpitkanotra@ymail.com';
  const newPassword = 'Password123!';
  
  const { data: usersData } = await adminSupabase.auth.admin.listUsers();
  const user = usersData.users.find(u => u.email === email);
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { password: newPassword });
  
  if (error) {
    console.log("Error resetting password:", error);
  } else {
    console.log(`Successfully reset password for ${email} to: ${newPassword}`);
  }
}

resetPassword();
