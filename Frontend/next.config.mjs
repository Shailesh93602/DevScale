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
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
