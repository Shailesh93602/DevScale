/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    autoPrerender: false,
  },
  images: {
    domains: ['aceternity.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
