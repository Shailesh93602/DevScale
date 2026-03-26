import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the EduScale team for any questions or feedback.',
};

export default function ContactPage() {
  return <ContactContent />;
}
