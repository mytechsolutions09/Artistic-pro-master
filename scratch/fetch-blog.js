const { createClient } = require('@supabase/supabase-js');

const url = 'https://varduayfdqivaofymfov.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjg1NTgsImV4cCI6MjA3MTk0NDU1OH0.xLXTzx2I0sv1XBTtbubz_MtEltvJRencQCt92cCGr8A';

const supabase = createClient(url, anonKey);

async function run() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .ilike('title', '%Abstract Wall Art%');

  if (error) {
    console.error('Error fetching blog post:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Found post:', data[0].title);
    const content = data[0].content;
    const index = content.indexOf('interpretation');
    if (index !== -1) {
      console.log('Text around interpretation:', content.substring(index - 100, index + 200));
    } else {
      console.log('Word "interpretation" not found in content.');
    }
  } else {
    console.log('No post found with that title.');
  }
}

run();
