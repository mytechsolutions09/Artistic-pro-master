import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid urls array provided.' }, { status: 400 });
    }

    const results = [];

    // Check each URL
    for (const url of urls) {
      // Basic URL validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        results.push({ url, ok: false, status: 'Invalid Protocol' });
        continue;
      }

      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        // Use HEAD request first to save bandwidth
        let response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        clearTimeout(id);

        // If HEAD is rejected or not allowed, fallback to GET
        if (!response.ok && (response.status === 405 || response.status === 403 || response.status >= 500)) {
          const getController = new AbortController();
          const getId = setTimeout(() => getController.abort(), 8000);
          response = await fetch(url, {
            method: 'GET',
            signal: getController.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          clearTimeout(getId);
        }

        results.push({ url, ok: response.ok, status: response.status });
      } catch (error: any) {
        results.push({ url, ok: false, status: error.name === 'AbortError' ? 'Timeout' : 'Failed to reach' });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Check links error:', error);
    return NextResponse.json(
      { error: 'Failed to process links.' },
      { status: 500 }
    );
  }
}
