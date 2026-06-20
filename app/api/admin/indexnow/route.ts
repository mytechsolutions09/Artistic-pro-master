import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urlList } = body;

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json(
        { error: 'urlList is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    const host = 'lurevi.in';
    const key = 'f5c29f6c1ed74c89a04676c1bfa14cf0';
    const keyLocation = 'https://lurevi.in/f5c29f6c1ed74c89a04676c1bfa14cf0.txt';

    // Normalize URLs to ensure they are absolute
    const normalizedUrlList = urlList.map((url: string) => {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) {
        // Ensure leading slash for relative paths
        if (!cleanUrl.startsWith('/')) {
          cleanUrl = '/' + cleanUrl;
        }
        return `https://${host}${cleanUrl}`;
      }
      return cleanUrl;
    });

    const payload = {
      host,
      key,
      keyLocation,
      urlList: normalizedUrlList
    };

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return NextResponse.json({ success: true, status: response.status });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `IndexNow API failed with status ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Error submitting to IndexNow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while submitting to IndexNow.' },
      { status: 500 }
    );
  }
}
