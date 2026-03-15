import { ComingSoon } from '@/components/ui/coming-soon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussions',
  description: 'Join the engineering conversation on EduScale.',
};

export default function DiscussionsPage() {
  return (
    <div className="container mx-auto py-20">
      <ComingSoon
        title="Discussions"
        description="A better way to discuss topics and get answers. We're rebuilding our discussion platform."
      />
    </div>
  );
}
