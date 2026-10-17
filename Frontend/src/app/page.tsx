import type { Metadata } from 'next';
import HomePage from '@/components/Landing/HomePage';

// The canonical lives here, not in the root layout: every page inherits a layout's metadata.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return <HomePage />;
}
