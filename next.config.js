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
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverActions: {
    bodySizeLimit: '2mb',
  },
  // Disable static optimization for error pages
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/:path*',
        headers: [{ key: 'x-custom-header', value: 'my custom header value' }],
      },
    ];
  },
  // Simplified rewrites
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:locale/404',
          destination: '/_not-found',
        },
        {
          source: '/:locale/500',
          destination: '/_error',
        }
      ],
    };
  }
};

const config = withNextIntl(nextConfig);

if (process.env.NODE_ENV === 'production') {
  config.webpack = (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  };
}

module.exports = config;