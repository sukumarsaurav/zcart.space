import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'igzvfdqqyexmpybrrhqm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
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
