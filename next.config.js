// /** @type {import('next').NextConfig} */
// const withNextIntl = require('next-intl/plugin')('./i18n.js');

// const nextConfig = {
//     output: 'standalone',
//     images: {
//       formats: ['image/webp'],
//       deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
//       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     },
//     output: 'standalone',
//     images: {
//       unoptimized: true,
//     },
//     experimental: {
//       appDir: true,
//     },
//     typescript: {
//       ignoreBuildErrors: true,
//     },
//     eslint: {
//       ignoreDuringBuilds: true,
//     }
//   }


// module.exports = withNextIntl(nextConfig);

/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.js');

const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  }
};

module.exports = withNextIntl(nextConfig);