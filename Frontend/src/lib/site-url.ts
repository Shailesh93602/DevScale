/** Absolute site origin — metadataBase, canonicals, robots, sitemap and the manifest all need it. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://eduscale.vercel.app';
