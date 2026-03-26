import { Metadata } from 'next';
import DoubtsContent from './DoubtsContent';

export const metadata: Metadata = {
  title: 'Doubts Corner',
  description:
    'Ask your engineering and programming questions to the EduScale community.',
};

export default function DoubtsPage() {
  return <DoubtsContent />;
}
