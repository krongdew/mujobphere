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
  // จัดการทั้ง auth routes และ error pages
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
  },
  // แก้ไข rewrites ให้ใช้ beforeFiles
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:locale/404',
          destination: '/404',
        },
        {
          source: '/:locale/500',
          destination: '/500',
        },
        {
          source: '/:locale/_error',
          destination: '/_error',
        },
        {
          source: '/404',
          destination: '/_not-found',
        },
        {
          source: '/500',
          destination: '/_error',
        }
      ]
    };
  }
};

// แยก config ก่อน wrap ด้วย withNextIntl
const config = withNextIntl(nextConfig);

// เพิ่มการกำหนดค่าพิเศษสำหรับ production
if (process.env.NODE_ENV === 'production') {
  config.webpack = (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  };
}

module.exports = config;