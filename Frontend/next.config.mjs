/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    autoPrerender: false,
  },
  images: {
    domains: [
      "assets.aceternity.com",
      "images.unsplash.com",
      "www.python.org",
      "example.com",
      "anotherdomain.com",
      "www.python.org",
      "v17.angular.io",
      "developer.mozilla.org",
      "www.php.net",
      "www.java.com",
      "flutter.dev",
    ],
  },
};

export default nextConfig;

// next.config.js
