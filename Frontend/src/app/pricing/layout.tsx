import type { Metadata } from 'next';

// The page is a client component, so its metadata lives in this thin server layout.
export const metadata: Metadata = {
  title: 'Pricing',
  description: 'What EduScale costs today: one free tier.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
