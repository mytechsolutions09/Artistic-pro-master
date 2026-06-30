const axios = require('axios');

async function run() {
  const url = 'https://lurevi.in/blog/how-to-choose-affordable-wall-art-that-looks-high-end-in-india';
  console.log('Fetching', url);
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    
    const html = res.data;
    console.log('HTML length:', html.length);

    // Extract all script type="application/ld+json" tags
    const scriptRegex = /<script\s+[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(html)) !== null) {
      count++;
      const content = match[1].trim();
      console.log(`\n--- Script Tag #${count} ---`);
      console.log('Length:', content.length);
      console.log('Preview:', content.substring(0, 100) + '...');
      
      try {
        JSON.parse(content);
        console.log('Status: VALID JSON');
      } catch (err) {
        console.log('Status: INVALID JSON');
        console.error('Error:', err.message);
        console.log('Full content:\n', content);
      }
    }
  } catch (err) {
    console.error('Error fetching page:', err.message);
  }
}

run();
