const { createClient } = require('@supabase/supabase-js');

const url = 'https://varduayfdqivaofymfov.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjg1NTgsImV4cCI6MjA3MTk0NDU1OH0.kMhhDklyw3fF7Z13U082l2nONHk0WqJvR-G3iY1uPqQ';

const adminSupabase = createClient(url, serviceKey);
const clientSupabase = createClient(url, anonKey);

async function test() {
  const email = 'arpitkanotra@ymail.com';
  const newPassword = 'TestPassword123!@';
  
  // 1. Update password via admin
  const { data: usersData } = await adminSupabase.auth.admin.listUsers();
  const user = usersData.users.find(u => u.email === email);
  if (!user) return console.log("User not found");
  
  console.log("Updating password for", user.id);
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, { password: newPassword });
  if (updateError) return console.log("Update Error:", updateError);
  
  console.log("Logging in via client...");
  const { data, error: loginError } = await clientSupabase.auth.signInWithPassword({
    email: email,
    password: newPassword
  });
  
  if (loginError) {
    console.log("Login Error:", loginError);
  } else {
    console.log("Login Success! Session:", data.session ? "Created" : "Null");
  }
}
test();
