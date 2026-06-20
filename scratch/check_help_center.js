const fs = require('fs');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/help-center');
    const text = await res.text();
    
    // Find Title
    const titleMatch = text.match(/<title>([^<]*)<\/title>/);
    console.log('--- Help Center ---');
    console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
    
    // Find description
    const descMatch = text.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                      text.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    console.log('Description:', descMatch ? descMatch[1] : 'NOT FOUND');
    
    // Find all H1s
    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    let match;
    const h1s = [];
    while ((match = h1Regex.exec(text)) !== null) {
      h1s.push(match[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s.length);
    console.log('H1 Tags Contents:', h1s);

    const res2 = await fetch('http://localhost:3000/categories/digital-art-prints');
    const text2 = await res2.text();
    console.log('\n--- Digital Art Prints ---');
    const h1s2 = [];
    let match2;
    const h1Regex2 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match2 = h1Regex2.exec(text2)) !== null) {
      h1s2.push(match2[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s2.length);
    console.log('H1 Tags Contents:', h1s2);

    const res3 = await fetch('http://localhost:3000/categories/football');
    const text3 = await res3.text();
    console.log('\n--- Category Football ---');
    const h1s3 = [];
    let match3;
    const h1Regex3 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match3 = h1Regex3.exec(text3)) !== null) {
      h1s3.push(match3[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s3.length);
    console.log('H1 Tags Contents:', h1s3);

    const res4 = await fetch('http://localhost:3000/categories/digital-art');
    const text4 = await res4.text();
    console.log('\n--- Category Digital Art ---');
    const h1s4 = [];
    let match4;
    const h1Regex4 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match4 = h1Regex4.exec(text4)) !== null) {
      h1s4.push(match4[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s4.length);
    console.log('H1 Tags Contents:', h1s4);

    const res5 = await fetch('http://localhost:3000/');
    const text5 = await res5.text();
    console.log('\n--- Home Page (/) ---');
    const titleMatch5 = text5.match(/<title>([^<]*)<\/title>/);
    console.log('Title:', titleMatch5 ? titleMatch5[1] : 'NOT FOUND');
    const descMatch5 = text5.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                      text5.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    console.log('Description:', descMatch5 ? descMatch5[1] : 'NOT FOUND');
    const h1s5 = [];
    let match5;
    const h1Regex5 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    const h1Regex5Full = /<h1[^>]*>[\s\S]*?<\/h1>/gi;
    let match5Full;
    while ((match5 = h1Regex5.exec(text5)) !== null) {
      h1s5.push(match5[1].trim());
    }
    console.log('H1 Tags Count:', h1s5.length);
    console.log('H1 Tags Contents:', h1s5);
    
    const h1s5Full = [];
    while ((match5Full = h1Regex5Full.exec(text5)) !== null) {
      h1s5Full.push(match5Full[0]);
    }
    console.log('H1 Tags Full HTML:', h1s5Full);

    const ogImgMatch = text5.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i) || 
                       text5.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:image["']/i);
    console.log('OG Image:', ogImgMatch ? ogImgMatch[1] : 'NOT FOUND');

    const imgRegex5 = /<img[^>]*>/gi;
    let imgMatch5;
    const imgs5 = [];
    while ((imgMatch5 = imgRegex5.exec(text5)) !== null) {
      imgs5.push(imgMatch5[0]);
    }
    console.log('Img Tags on Home Page:', imgs5);

    const res6 = await fetch('http://localhost:3000/categories');
    const text6 = await res6.text();
    console.log('\n--- Categories Page (/categories) ---');
    const titleMatch6 = text6.match(/<title>([^<]*)<\/title>/);
    console.log('Title:', titleMatch6 ? titleMatch6[1] : 'NOT FOUND');
    const descMatch6 = text6.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                       text6.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    console.log('Description:', descMatch6 ? descMatch6[1] : 'NOT FOUND');
    const h1s6 = [];
    let match6;
    const h1Regex6 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match6 = h1Regex6.exec(text6)) !== null) {
      h1s6.push(match6[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s6.length);
    console.log('H1 Tags Contents:', h1s6);

    const res7 = await fetch('http://localhost:3000/categories/football/crimson-lionel-messi-legacy');
    const text7 = await res7.text();
    console.log('\n--- Product Page (/categories/football/crimson-lionel-messi-legacy) ---');
    const titleMatch7 = text7.match(/<title>([^<]*)<\/title>/);
    console.log('Title:', titleMatch7 ? titleMatch7[1] : 'NOT FOUND');
    const h1s7 = [];
    let match7;
    const h1Regex7 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match7 = h1Regex7.exec(text7)) !== null) {
      h1s7.push(match7[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s7.length);
    console.log('H1 Tags Contents:', h1s7);

    const res8 = await fetch('http://localhost:3000/blog/breaking-bad-series-poster');
    const text8 = await res8.text();
    console.log('\n--- Blog Page (/blog/breaking-bad-series-poster) ---');
    const titleMatch8 = text8.match(/<title>([^<]*)<\/title>/);
    console.log('Title:', titleMatch8 ? titleMatch8[1] : 'NOT FOUND');
    const descMatch8 = text8.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                       text8.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    console.log('Description:', descMatch8 ? descMatch8[1] : 'NOT FOUND');
    const h1s8 = [];
    let match8;
    const h1Regex8 = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    while ((match8 = h1Regex8.exec(text8)) !== null) {
      h1s8.push(match8[1].trim().replace(/<[^>]*>/g, ''));
    }
    console.log('H1 Tags Count:', h1s8.length);
    console.log('H1 Tags Contents:', h1s8);

  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
