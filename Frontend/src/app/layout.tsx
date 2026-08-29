import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactNode, Suspense } from 'react';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ReduxProvider } from '@/contexts/ReduxContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';
import type { Metadata } from 'next';

/** Absolute site origin — metadataBase, canonicals and JSON-LD all need it. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://eduscale.vercel.app';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: {
    default: 'EduScale | All-in-One Engineering Learning Platform',
    template: '%s | EduScale',
  },
  description:
    'EduScale is the all-in-one platform for engineering students. Personalized roadmaps, community support, placement preparation, coding challenges, and interactive learning. Built by Shailesh Chaudhari.',
  keywords: [
    'engineering',
    'learning platform',
    'coding challenges',
    'placement preparation',
    'edtech',
    'career roadmap',
  ],
  authors: [{ name: 'Shailesh Chaudhari' }],
  creator: 'Shailesh Chaudhari',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eduscale.vercel.app',
    title: 'EduScale | All-in-One Engineering Learning Platform',
    description:
      'Personalized roadmaps, community support, and interactive challenges for engineering students.',
    siteName: 'EduScale',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduScale | Engineering Learning Platform',
    description:
      'Personalized roadmaps, community support, and interactive challenges.',
  },
  robots: {
    index: true,
    follow: true,
  },
  // Without metadataBase, Next.js cannot turn a relative OG image path into the
  // absolute URL that crawlers and social cards require — it warns at build
  // time and emits a relative URL that every scraper then fails to fetch.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
};

/**
 * Origins worth a preconnect, derived from configuration.
 *
 * `null` when the value is missing, same-origin, or points at a development
 * machine — a preconnect to localhost in production is a wasted round trip and
 * an embarrassing line in view-source.
 */
function preconnectOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const { origin, hostname } = new URL(raw);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
    if (origin === SITE_URL) return null;
    return origin;
  } catch {
    return null;
  }
}

const apiPreconnectOrigin = preconnectOrigin(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);
const supabaseOrigin = preconnectOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'EduScale',
      description:
        'Learning platform for engineering students: career roadmaps, coding challenges, real-time battles and placement preparation.',
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'EduScale',
      url: SITE_URL,
      // No `logo` and no `sameAs`. Both are tempting because they improve how a
      // result renders, and both would be claims this project cannot back:
      // there is no brand logo asset, and no social profiles that belong to it.
      // Structured data is read by machines that do not forgive invention.
      founder: { '@type': 'Person', name: 'Shailesh Chaudhari' },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          The API preconnect is derived, never hardcoded.

          This used to be a literal `http://localhost:4000`, and it shipped —
          every visitor to the production site was told to preconnect to their
          OWN machine, over plain http, from an https page. It is visible in
          view-source, it wastes a connection attempt, and it is the kind of
          detail someone reading the source draws conclusions from.

          Rendered only when the API is on a different origin AND that origin is
          not localhost: preconnecting to same-origin is redundant, and
          preconnecting to a dev machine is what caused this.
        */}
        {apiPreconnectOrigin && (
          <link rel="preconnect" href={apiPreconnectOrigin} />
        )}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} />}
        {/*
          Structured data. Answer engines and AI crawlers read JSON-LD to decide
          what a site IS — without it they are left inferring from prose, and
          they infer badly. There was none of this at all.

          WebSite + Organization on the root only. Per-page types (Course,
          Article) belong on those pages, where the data to fill them honestly
          actually exists; emitting a half-filled schema sitewide is worse than
          emitting none, because it asserts things the page cannot back up.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} font-outfit selection:bg-primary/30 min-h-screen bg-background text-foreground antialiased selection:text-primary`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastContainer />
          <WebSocketProvider>
            <ReduxProvider>
              {/* AuthProvider must be inside ReduxProvider — App.tsx syncs auth → Redux */}
              <AuthProvider>
                <App>
                  <Suspense fallback={<Loader type="SiteLoader" />}>
                    {children}
                  </Suspense>
                </App>
              </AuthProvider>
            </ReduxProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
