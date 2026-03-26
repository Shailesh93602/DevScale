import { Metadata } from 'next';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about EduScale.',
};

export default function FAQPage() {
  return <FAQContent />;
}
