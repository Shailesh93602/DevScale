import { withSentryConfig } from '@sentry/nextjs';
import { legacyRedirects } from './src/lib/legacy-redirects.mjs';

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
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // /login, /register, /signup, /sign-up → the real /auth/* pages. These are
  // edge redirects (308) rather than page stubs calling permanentRedirect():
  // the stubs shipped and the live site still answered /login with a 200 empty
  // shell and /register with a 404. See src/lib/legacy-redirects.mjs.
  async redirects() {
    return legacyRedirects;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Build identity, baked into the bundle so /api/version (src/lib/app-version.ts)
  // can answer even where Vercel's system env is not exposed to functions. The
  // build step always has the git vars — vercel.json's ignoreCommand depends on
  // one. `env` values must be strings, hence the `?? ''` (empty reads as
  // "unknown" downstream). Build TIME lives only here: it is the one field that
  // must be fixed at build and never computed per request.
  env: {
    APP_BUILD_GIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    APP_BUILD_GIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    APP_BUILD_VERCEL_ENV: process.env.VERCEL_ENV ?? '',
    APP_BUILD_TIME: new Date().toISOString(),
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'shailesh-chaudhari',

  project: 'eduscale-personal-frontend',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
