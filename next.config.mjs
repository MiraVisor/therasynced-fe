/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile packages that use ES modules
  transpilePackages: ['@tanstack/react-table', '@tanstack/table-core'],

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
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Remove console logs in production (keeps console.error and console.warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Fix for @tanstack/react-table ES module parsing
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
      };
    }

    // Handle ES modules in @tanstack packages
    config.module.rules.unshift({
      test: /node_modules\/@tanstack\/.*\.(mjs|esm\.js|js)$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
      parser: {
        sourceType: 'module',
      },
    });

    return config;
  },

  // Security headers
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
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
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
                    "font-src 'self' https://fonts.gstatic.com https://js.stripe.com data:",
                    "img-src 'self' data: https: blob:",
                    "connect-src 'self' http://localhost:* https://api.stripe.com https://*.cloudinary.com https://backend.mehadnadeem.com https://api.bigdatacloud.net https://*.supabase.co ws://localhost:* wss://backend.mehadnadeem.com",
                    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                  ].join('; ')
                : [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://vercel.live",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com https://js.stripe.com data:",
                    "img-src 'self' data: https: blob:",
                    "connect-src 'self' https://api.stripe.com https://*.cloudinary.com https://backend.mehadnadeem.com https://api.bigdatacloud.net https://*.supabase.co https://vercel.live wss://backend.mehadnadeem.com",
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
