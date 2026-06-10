const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://varduayfdqivaofymfov.supabase.co';
// Use anon key to simulate client login
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

const envFile = require('fs').readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testLogin() {
  console.log("Attempting phone login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: '+919999912873',
    password: 'WrongPassword123!'
  });
  
  if (error) {
    console.log("Login Error:", error.message);
  } else {
    console.log("Login Success");
  }
}

testLogin();
