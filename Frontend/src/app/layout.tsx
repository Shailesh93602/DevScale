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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="http://localhost:4000" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://imelyvyxycwkywurifum.supabase.co"
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
