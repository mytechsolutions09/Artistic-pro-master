const { createClient } = require('@supabase/supabase-js');

const url = 'https://varduayfdqivaofymfov.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM2ODU1OCwiZXhwIjoyMDcxOTQ0NTU4fQ.4mxrgdhYkpS2Yy6mw-NkLSe-dkFw-5OaeEEJ7m-rKTw';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjg1NTgsImV4cCI6MjA3MTk0NDU1OH0.kMhhDklyw3fF7Z13U082l2nONHk0WqJvR-G3iY1uPqQ';

const adminSupabase = createClient(url, serviceKey);
const clientSupabase = createClient(url, anonKey);

async function test() {
  const email = 'arpitkanotra@ymail.com';
  
  console.log("Generating link for", email);
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email
  });
  
  if (error) return console.log("Generate Link Error:", error);
  
  const actionUrl = new URL(data.properties.action_link);
  const tokenHash = actionUrl.searchParams.get('token');
  
  console.log("Logging in via client using token_hash...");
  const { data: loginData, error: loginError } = await clientSupabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink'
  });
  
  if (loginError) {
    console.log("Login Error:", loginError);
  } else {
    console.log("Login Success! Session:", loginData.session ? "Created" : "Null");
  }
}
test();
