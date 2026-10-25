import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';
import { battleCopy } from '@/lib/battle-claims';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduScale — All-in-One Engineering Learning Platform',
    short_name: 'EduScale',
    description: battleCopy().meta.manifest,
    start_url: '/',
    display: 'standalone',
    background_color: '#5b008f',
    theme_color: '#8300b8',
    orientation: 'portrait',
    scope: '/',
    id: SITE_URL,
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
