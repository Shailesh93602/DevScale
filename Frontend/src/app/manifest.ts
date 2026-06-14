import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduScale — All-in-One Engineering Learning Platform',
    short_name: 'EduScale',
    description:
      'Real-time engineering learning platform with 1v1 coding battles, distributed locking (Redlock), circuit breakers (opossum), and Prometheus metrics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#5b008f',
    theme_color: '#8300b8',
    orientation: 'portrait',
    scope: '/',
    id: 'https://eduscale.vercel.app',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
