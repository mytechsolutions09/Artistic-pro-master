/**
 * Default cover when blog_posts.cover_image is null (legacy rows or drafts without upload).
 * HTTPS, hotlink-friendly; replace with your own asset URL if preferred.
 */
export const DEFAULT_BLOG_COVER =
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80&auto=format&fit=crop';

export function blogCoverUrl(coverImage: string | null | undefined): string {
  const trimmed = typeof coverImage === 'string' ? coverImage.trim() : '';
  return trimmed || DEFAULT_BLOG_COVER;
}

/**
 * List pages need a stable cache-bust when the row updates but the browser still caches by image URL.
 */
export function blogCoverSrcWithBust(
  coverImage: string | null | undefined,
  updatedAt: string | null | undefined
): string {
  const base = blogCoverUrl(coverImage);
  const bust = updatedAt ? encodeURIComponent(updatedAt) : '';
  if (!bust) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${bust}`;
}
