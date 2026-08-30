import { Metadata } from 'next';
import FAQContent from './FAQContent';
import { buildFaqJsonLd } from './faqs';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about EduScale.',
};

// /faq previously shipped with no FAQPage markup at all — the content lived
// inside a client component the server page could not reach. It is built from
// the same array the page renders; see faqs.ts for why that matters.
const jsonLd = buildFaqJsonLd('https://eduscale.vercel.app');

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQContent />
    </>
  );
}
