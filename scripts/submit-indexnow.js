const https = require('https');

const host = 'lurevi.in';
const key = '7a81e527d5c240fcb33d79b83c15efce';
const keyLocation = `https://${host}/${key}.txt`;
const sitemapUrl = `https://${host}/sitemap.xml`;

async function fetchSitemapUrls() {
  console.log(`Fetching sitemap from ${sitemapUrl}...`);
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    
    // Extract URLs from <loc> tags
    const urls = [];
    const regex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      urls.push(match[1]);
    }
    
    console.log(`Found ${urls.length} URLs in the sitemap.`);
    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    // Fallback static URLs if sitemap fetch fails
    return [
      `https://${host}/`,
      `https://${host}/collections/luxury-wall-art`
    ];
  }
}

async function submitToIndexNow(urls) {
  if (!urls || urls.length === 0) {
    console.log('No URLs to submit.');
    return;
  }
  
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);
  
  const data = JSON.stringify({
    host: host,
    key: key,
    keyLocation: keyLocation,
    urlList: urls
  });

  const options = {
    hostname: 'api.indexnow.org',
    path: '/IndexNow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      switch(res.statusCode) {
        case 200:
        case 202:
          console.log('✅ Success: All URLs submitted successfully (Accepted).');
          break;
        case 400:
          console.log('❌ Error: Bad request (Invalid format).', responseData);
          break;
        case 403:
          console.log('❌ Error: Forbidden (Key not valid or not found on the server).', responseData);
          break;
        case 422:
          console.log('❌ Error: Unprocessable Entity (URLs don\'t belong to the host or key mismatch).', responseData);
          break;
        case 429:
          console.log('❌ Error: Too Many Requests (Potential Spam).', responseData);
          break;
        default:
          console.log(`Unhandled status code: ${res.statusCode}`, responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error submitting to IndexNow:', error);
  });

  req.write(data);
  req.end();
}

async function main() {
  const urls = await fetchSitemapUrls();
  await submitToIndexNow(urls);
}

main();
