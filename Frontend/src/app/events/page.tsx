import { ComingSoon } from '@/components/ui/coming-soon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Join live engineering events, webinars, and workshops on EduScale.',
};

export default function EventsPage() {
  return (
    <div className="container mx-auto py-20">
      <ComingSoon
        title="Engineering Events"
        description="We're organizing some amazing webinars, workshops, and hackathons. They'll be listed here soon!"
      />
    </div>
  );
}
