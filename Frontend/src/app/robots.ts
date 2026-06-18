import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://eduscale.vercel.app/sitemap.xml',
    host: 'https://eduscale.vercel.app',
  };
}
