/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

// Explicitly point to the request file in src/i18n/request.ts
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  transpilePackages: ['react-map-gl'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig);
