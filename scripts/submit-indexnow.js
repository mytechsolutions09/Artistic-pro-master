const https = require('https');

// The domain of your website
const host = 'lurevi.in';

// The IndexNow API key you generated
const key = 'a318014dfa024631913b1aaea92fbf46';

// The location of your key file hosted on your site
const keyLocation = 'https://lurevi.in/a318014dfa024631913b1aaea92fbf46.txt';

// The list of URLs you want to submit to search engines
const urlList = [
  'https://lurevi.in/',
  'https://lurevi.in/collections/luxury-wall-art',
  // Add more URLs here as needed
];

const data = JSON.stringify({
  host: host,
  key: key,
  keyLocation: keyLocation,
  urlList: urlList
});

const options = {
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  switch(res.statusCode) {
    case 200:
      console.log('Success: URL submitted successfully.');
      break;
    case 400:
      console.log('Error: Bad request (Invalid format).');
      break;
    case 403:
      console.log('Error: Forbidden (Key not valid or not found on the server).');
      break;
    case 422:
      console.log('Error: Unprocessable Entity (URLs don\'t belong to the host or key mismatch).');
      break;
    case 429:
      console.log('Error: Too Many Requests (Potential Spam).');
      break;
    default:
      console.log('Unhandled status code.');
  }

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Error submitting to IndexNow:', error);
});

req.write(data);
req.end();
