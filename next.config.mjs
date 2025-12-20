/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Production optimizations
  experimental: {
    // Disable static generation for client-side pages
    workerThreads: false,
    cpus: 1,
    // Enable optimizations
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      '@react-pdf/renderer',
      'date-fns',
      'react-hook-form',
      '@tanstack/react-table',
    ],
  },
  // Bundle analyzer (uncomment for analysis)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Optimize bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce bundle size by excluding server-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for large libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Separate chunk for recharts
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // Separate chunk for react-pdf
          reactPdf: {
            name: 'react-pdf',
            test: /[\\/]node_modules[\\/]@react-pdf[\\/]/,
            chunks: 'all',
            priority: 30,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };
    return config;
  },
  // Ensure CSS is properly loaded
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'development'
                ? [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' data: https: blob:",
                    "connect-src 'self' http://localhost:* https://api.stripe.com https://*.cloudinary.com https://backend.mehadnadeem.com ws://localhost:* wss://backend.mehadnadeem.com",
                    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                  ].join('; ')
                : [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' data: https: blob:",
                    "connect-src 'self' https://api.stripe.com https://*.cloudinary.com https://backend.mehadnadeem.com wss://backend.mehadnadeem.com",
                    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    'upgrade-insecure-requests',
                  ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
