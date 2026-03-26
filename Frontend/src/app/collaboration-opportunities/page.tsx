import { ComingSoon } from '@/components/ui/coming-soon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collaboration Opportunities',
  description: 'Find partners for your next engineering project on EduScale.',
};

export default function CollaborationPage() {
  return (
    <div className="container mx-auto py-20">
      <ComingSoon
        title="Collaboration Hub"
        description="Looking for a partner for your college project or a startup idea? Our collaboration hub is almost ready!"
      />
    </div>
  );
}
