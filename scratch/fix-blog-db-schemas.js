const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let url = '';
let anonKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      url = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      anonKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error('Failed to parse .env file:', e);
}

if (!url || !anonKey) {
  console.error('Supabase env vars missing from .env!');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  console.log('Fetching all blog posts from database...');
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content');

  if (error || !posts) {
    console.error('Error fetching blog posts:', error);
    return;
  }

  console.log(`Found ${posts.length} blog posts.`);

  for (const post of posts) {
    let content = post.content || '';
    let hasChanges = false;

    // Search for script tags
    const scriptRegex = /<script\s+[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    
    // We want to find matches and check if we can fix them
    while ((match = scriptRegex.exec(content)) !== null) {
      const fullScriptTag = match[0];
      const jsonContent = match[1];
      
      try {
        JSON.parse(jsonContent.trim());
      } catch (err) {
        console.log(`\nFound malformed JSON in post: "${post.title}" (${post.slug})`);
        console.log('Error:', err.message);
        
        // Let's fix the trailing comma before closing brace pattern:
        // Match a comma followed by whitespace/newlines and then the closing brace at the very end of the JSON object
        const fixedJson = jsonContent.replace(/,\s*}\s*$/, '\n}');
        
        try {
          JSON.parse(fixedJson.trim());
          console.log('Successfully fixed JSON locally!');
          
          const fixedScriptTag = fullScriptTag.replace(jsonContent, fixedJson);
          content = content.replace(fullScriptTag, fixedScriptTag);
          hasChanges = true;
        } catch (err2) {
          console.error('Failed to automatically fix JSON:', err2.message);
          console.log('Malformed JSON content was:', jsonContent);
        }
      }
    }

    if (hasChanges) {
      console.log(`Updating post: "${post.title}"...`);
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ content })
        .eq('id', post.id);

      if (updateError) {
        console.error('Error updating post in database:', updateError);
      } else {
        console.log(`Successfully updated post "${post.title}"!`);
      }
    }
  }

  console.log('\nDone.');
}

run();
