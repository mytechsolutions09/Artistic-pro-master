const fs = require('fs');
const https = require('https');
const http = require('http');

const SUPABASE_URL = 'https://varduayfdqivaofymfov.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjg1NTgsImV4cCI6MjA3MTk0NDU1OH0.xLXTzx2I0sv1XBTtbubz_MtEltvJRencQCt92cCGr8A';

async function fetchBlogs() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,content,cover_image`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await response.json();
  return data;
}

function extractLinks(text) {
  if (!text) return [];
  const links = [];
  
  // Markdown images: ![alt](url)
  const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = mdImgRegex.exec(text)) !== null) {
    links.push(match[1]);
  }

  // Markdown links: [text](url)
  const mdLinkRegex = /(?<!\!)\[.*?\]\((.*?)\)/g;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    links.push(match[1]);
  }

  // HTML images: <img src="url" ...>
  const htmlImgRegex = /<img.*?src=["'](.*?)["']/gi;
  while ((match = htmlImgRegex.exec(text)) !== null) {
    links.push(match[1]);
  }

  // HTML links: <a href="url" ...>
  const htmlLinkRegex = /<a.*?href=["'](.*?)["']/gi;
  while ((match = htmlLinkRegex.exec(text)) !== null) {
    links.push(match[1]);
  }

  return [...new Set(links)]; // deduplicate
}

async function checkLink(url) {
  if (url.startsWith('/')) {
    // Local link, assume ok for now or check against prod site
    url = 'https://lurevi.in' + url;
  }
  
  if (!url.startsWith('http')) return { url, status: 'Invalid format', ok: false };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    clearTimeout(id);
    
    // If HEAD fails (some sites block it), try GET
    if (response.status === 405 || response.status === 403) {
      const controllerGet = new AbortController();
      const idGet = setTimeout(() => controllerGet.abort(), 10000);
      const getResponse = await fetch(url, { 
        method: 'GET', 
        signal: controllerGet.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(idGet);
      return { url, status: getResponse.status, ok: getResponse.ok };
    }
    
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: error.message, ok: false };
  }
}

async function main() {
  console.log('Fetching blog posts...');
  const posts = await fetchBlogs();
  console.log(`Found ${posts.length} blog posts.`);
  
  const brokenLinks = [];

  for (const post of posts) {
    const links = extractLinks(post.content);
    if (post.cover_image) {
      links.push(post.cover_image);
    }

    if (links.length > 0) {
      console.log(`\nChecking ${links.length} links for post: "${post.title}" (ID: ${post.id})`);
      for (const link of links) {
        const result = await checkLink(link);
        if (result.ok) {
          process.stdout.write('.');
        } else {
          process.stdout.write('X');
          brokenLinks.push({
            post_id: post.id,
            post_title: post.title,
            url: link,
            status: result.status
          });
        }
      }
    }
  }

  console.log('\n\n--- Report ---');
  if (brokenLinks.length === 0) {
    console.log('No broken links found!');
  } else {
    console.log(`Found ${brokenLinks.length} broken links:`);
    brokenLinks.forEach(bl => {
      console.log(`- Post: "${bl.post_title}"`);
      console.log(`  URL:  ${bl.url}`);
      console.log(`  Err:  ${bl.status}`);
    });
    // Save to a file for easy viewing
    fs.writeFileSync('broken_links.json', JSON.stringify(brokenLinks, null, 2));
    console.log('\nSaved report to broken_links.json');
  }
}

main().catch(console.error);
