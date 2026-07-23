import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'igzvfdqqyexmpybrrhqm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Placeholder imagery for dev-seeded demo data only.
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async rewrites() {
    return [
      // Rewrite /<shopSlug>/* paths for local development
      // In production, middleware handles subdomain detection
    ]
  },
}

export default nextConfig
