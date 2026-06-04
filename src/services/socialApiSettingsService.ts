'use client';

import { supabase } from './supabaseService';

// ---------------------------------------------------------------------------
// Types (mirrored from the API route)
// ---------------------------------------------------------------------------

export interface TwitterCreds {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface FacebookCreds {
  pageAccessToken: string;
  pageId: string;
}

export interface InstagramCreds {
  userAccessToken: string;
  igUserId: string;
}

export interface LinkedInCreds {
  accessToken: string;
  personUrn: string;
}

export interface PinterestCreds {
  accessToken: string;
  boardId: string;
}

export interface SocialApiCredentials {
  twitter: TwitterCreds;
  facebook: FacebookCreds;
  instagram: InstagramCreds;
  linkedin: LinkedInCreds;
  pinterest: PinterestCreds;
}

const PLATFORMS = ['twitter', 'facebook', 'instagram', 'linkedin', 'pinterest'] as const;
type PlatformKey = (typeof PLATFORMS)[number];

export const defaultSocialApiCredentials = (): SocialApiCredentials => ({
  twitter:   { apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' },
  facebook:  { pageAccessToken: '', pageId: '' },
  instagram: { userAccessToken: '', igUserId: '' },
  linkedin:  { accessToken: '', personUrn: '' },
  pinterest: { accessToken: '', boardId: '' },
});

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class SocialApiSettingsService {
  /**
   * Load all platform credentials from Supabase.
   * Requires the user to be authenticated (admin).
   */
  static async loadCredentials(): Promise<SocialApiCredentials> {
    try {
      const { data, error } = await supabase
        .from('social_api_settings')
        .select('platform, credentials')
        .in('platform', PLATFORMS as unknown as string[]);

      if (error) {
        console.error('[SocialApiSettings] load error:', error.message);
        return defaultSocialApiCredentials();
      }

      const result = defaultSocialApiCredentials();
      for (const row of data ?? []) {
        const p = row.platform as PlatformKey;
        if (PLATFORMS.includes(p) && row.credentials) {
          (result as Record<PlatformKey, unknown>)[p] = {
            ...(result as Record<PlatformKey, unknown>)[p] as object,
            ...(row.credentials as object),
          };
        }
      }
      return result;
    } catch (err) {
      console.error('[SocialApiSettings] unexpected error:', err);
      return defaultSocialApiCredentials();
    }
  }

  /**
   * Persist all platform credentials to Supabase.
   * Uses upsert so it works whether seed rows exist or not.
   */
  static async saveCredentials(creds: SocialApiCredentials): Promise<{ success: boolean; error?: string }> {
    const rows = PLATFORMS.map((platform) => ({
      platform,
      credentials: (creds as Record<PlatformKey, unknown>)[platform],
    }));

    const { error } = await supabase
      .from('social_api_settings')
      .upsert(rows, { onConflict: 'platform' });

    if (error) {
      console.error('[SocialApiSettings] save error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
}
