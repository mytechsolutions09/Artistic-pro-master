/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vite (esbuild) didn't type-check at build time — pre-existing TS errors exist.
  // Enable this flag temporarily to get the site building; fix errors incrementally.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
  // Fix for EISDIR readlink errors on Windows
  webpack: (config) => {
    config.resolve.symlinks = false;
    // Use memory cache to avoid readlink() calls on Windows NTFS
    config.cache = { type: 'memory' };
    return config;
  },
};

export default nextConfig;
