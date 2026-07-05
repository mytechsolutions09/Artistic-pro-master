import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Server-side Supabase client (service role — bypasses RLS)
// Credentials are read directly from DB; they never travel over the browser
// network in the POST body.
// ---------------------------------------------------------------------------

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TwitterCreds { apiKey: string; apiSecret: string; accessToken: string; accessTokenSecret: string; }
interface FacebookCreds { pageAccessToken: string; pageId: string; }
interface InstagramCreds { userAccessToken: string; igUserId: string; }
interface LinkedInCreds { accessToken: string; personUrn: string; }
interface PinterestCreds { accessToken: string; boardId: string; }

interface AllCreds {
  twitter?: TwitterCreds;
  facebook?: FacebookCreds;
  instagram?: InstagramCreds;
  linkedin?: LinkedInCreds;
  pinterest?: PinterestCreds;
}

interface PostPayload {
  body: string;
  tags: string;
  linkUrl: string;
  imageUrl: string;
  platforms: string[];
}

interface PostResult {
  platform: string;
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Load credentials from Supabase (service role, server-side only)
// ---------------------------------------------------------------------------

async function loadCredentials(): Promise<AllCreds> {
  const db = getAdminSupabase();
  const { data, error } = await db
    .from('social_api_settings')
    .select('platform, credentials');

  if (error || !data) {
    console.error('[social/post] cred load error:', error?.message);
    return {};
  }

  const out: AllCreds = {};
  for (const row of data) {
    (out as Record<string, unknown>)[row.platform] = row.credentials;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Twitter OAuth 1.0a signing (no external deps)
// ---------------------------------------------------------------------------

function percentEncode(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function buildOAuth1Header(
  method: 'POST' | 'GET',
  url: string,
  params: Record<string, string>,
  creds: TwitterCreds
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  };

  const allParams = { ...params, ...oauthParams };
  const sortedParamStr = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const signatureBase = `${method}&${percentEncode(url)}&${percentEncode(sortedParamStr)}`;
  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessTokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

  const headerFields = { ...oauthParams, oauth_signature: signature };
  const headerStr = Object.keys(headerFields)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(headerFields[k])}"`)
    .join(', ');

  return `OAuth ${headerStr}`;
}

// ---------------------------------------------------------------------------
// Platform posting
// ---------------------------------------------------------------------------

async function postToTwitter(creds: TwitterCreds, text: string): Promise<PostResult> {
  const url = 'https://api.twitter.com/2/tweets';
  const authHeader = buildOAuth1Header('POST', url, {}, creds);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 280) }),
    });
    const json = await res.json() as { data?: { id?: string }; detail?: string; title?: string };
    if (!res.ok) {
      return { platform: 'twitter', success: false, message: `Twitter: ${json.detail ?? json.title ?? res.status}` };
    }
    return { platform: 'twitter', success: true, message: `Tweet posted — ID ${json.data?.id}` };
  } catch (e: unknown) {
    return { platform: 'twitter', success: false, message: `Twitter network error: ${(e as Error).message}` };
  }
}

async function postToFacebook(creds: FacebookCreds, message: string, link?: string): Promise<PostResult> {
  const url = `https://graph.facebook.com/v19.0/${creds.pageId}/feed`;
  const body: Record<string, string> = { message, access_token: creds.pageAccessToken };
  if (link) body.link = link;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { id?: string; error?: { message?: string } };
    if (!res.ok || json.error) {
      return { platform: 'facebook', success: false, message: `Facebook: ${json.error?.message ?? res.status}` };
    }
    return { platform: 'facebook', success: true, message: `Facebook post — ID ${json.id}` };
  } catch (e: unknown) {
    return { platform: 'facebook', success: false, message: `Facebook network error: ${(e as Error).message}` };
  }
}

async function postToInstagram(creds: InstagramCreds, caption: string, imageUrl: string): Promise<PostResult> {
  if (!imageUrl) {
    return { platform: 'instagram', success: false, message: 'Instagram requires an image URL — text-only posts are not supported.' };
  }
  const base = `https://graph.facebook.com/v19.0/${creds.igUserId}`;
  try {
    const containerRes = await fetch(`${base}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: creds.userAccessToken }),
    });
    const container = await containerRes.json() as { id?: string; error?: { message?: string } };
    if (!containerRes.ok || container.error) {
      return { platform: 'instagram', success: false, message: `Instagram media: ${container.error?.message ?? containerRes.status}` };
    }
    const publishRes = await fetch(`${base}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: container.id, access_token: creds.userAccessToken }),
    });
    const published = await publishRes.json() as { id?: string; error?: { message?: string } };
    if (!publishRes.ok || published.error) {
      return { platform: 'instagram', success: false, message: `Instagram publish: ${published.error?.message ?? publishRes.status}` };
    }
    return { platform: 'instagram', success: true, message: `Instagram post — ID ${published.id}` };
  } catch (e: unknown) {
    return { platform: 'instagram', success: false, message: `Instagram network error: ${(e as Error).message}` };
  }
}

async function postToLinkedIn(creds: LinkedInCreds, text: string): Promise<PostResult> {
  const body = {
    author: creds.personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };
  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { id?: string; message?: string };
    if (!res.ok) {
      return { platform: 'linkedin', success: false, message: `LinkedIn: ${json.message ?? res.status}` };
    }
    return { platform: 'linkedin', success: true, message: `LinkedIn post — ID ${json.id}` };
  } catch (e: unknown) {
    return { platform: 'linkedin', success: false, message: `LinkedIn network error: ${(e as Error).message}` };
  }
}

async function postToPinterest(creds: PinterestCreds, description: string, imageUrl: string, linkUrl?: string): Promise<PostResult> {
  if (!imageUrl) {
    return { platform: 'pinterest', success: false, message: 'Pinterest requires an image URL.' };
  }
  const body: Record<string, unknown> = {
    board_id: creds.boardId,
    description,
    media_source: { source_type: 'image_url', url: imageUrl },
  };
  if (linkUrl) body.link = linkUrl;
  try {
    const res = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { id?: string; message?: string };
    if (!res.ok) {
      return { platform: 'pinterest', success: false, message: `Pinterest: ${json.message ?? res.status}` };
    }
    return { platform: 'pinterest', success: true, message: `Pin created — ID ${json.id}` };
  } catch (e: unknown) {
    return { platform: 'pinterest', success: false, message: `Pinterest network error: ${(e as Error).message}` };
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let payload: PostPayload;
  try {
    payload = await req.json() as PostPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { body, tags, linkUrl, imageUrl, platforms } = payload;
  const fullText = [body, tags].filter(Boolean).join('\n\n');

  // Load credentials server-side — never from the request body
  const creds = await loadCredentials();
  const results: PostResult[] = [];

  for (const platform of platforms) {
    switch (platform) {
      case 'twitter': {
        const c = creds.twitter;
        if (!c?.apiKey) results.push({ platform: 'twitter', success: false, message: 'Twitter credentials not configured — add them in API Keys.' });
        else results.push(await postToTwitter(c, [fullText, linkUrl].filter(Boolean).join('\n')));
        break;
      }
      case 'facebook': {
        const c = creds.facebook;
        if (!c?.pageAccessToken) results.push({ platform: 'facebook', success: false, message: 'Facebook credentials not configured — add them in API Keys.' });
        else results.push(await postToFacebook(c, fullText, linkUrl || undefined));
        break;
      }
      case 'instagram': {
        const c = creds.instagram;
        if (!c?.userAccessToken) results.push({ platform: 'instagram', success: false, message: 'Instagram credentials not configured — add them in API Keys.' });
        else results.push(await postToInstagram(c, fullText, imageUrl));
        break;
      }
      case 'linkedin': {
        const c = creds.linkedin;
        if (!c?.accessToken) results.push({ platform: 'linkedin', success: false, message: 'LinkedIn credentials not configured — add them in API Keys.' });
        else results.push(await postToLinkedIn(c, [fullText, linkUrl].filter(Boolean).join('\n')));
        break;
      }
      case 'pinterest': {
        const c = creds.pinterest;
        if (!c?.accessToken) results.push({ platform: 'pinterest', success: false, message: 'Pinterest credentials not configured — add them in API Keys.' });
        else results.push(await postToPinterest(c, fullText, imageUrl, linkUrl || undefined));
        break;
      }
      default:
        results.push({ platform, success: false, message: `Platform "${platform}" is not supported yet.` });
    }
  }

  return NextResponse.json({ results });
}
