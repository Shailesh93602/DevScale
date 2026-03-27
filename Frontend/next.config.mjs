import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.aceternity.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.python.org' },
      { protocol: 'https', hostname: 'v17.angular.io' },
      { protocol: 'https', hostname: 'developer.mozilla.org' },
      { protocol: 'https', hostname: 'www.php.net' },
      { protocol: 'https', hostname: 'www.java.com' },
      { protocol: 'https', hostname: 'flutter.dev' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(nextConfig, {
  // Set in CI env vars — not committed
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress Sentry build logs in dev
  silent: process.env.NODE_ENV !== 'production',

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
});
