import { ComingSoon } from '@/components/ui/coming-soon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Highlights',
  description: 'Celebrating the achievements of the EduScale community.',
};

export default function HighlightsPage() {
  return (
    <div className="container mx-auto py-20">
      <ComingSoon
        title="Member Highlights"
        description="Celebrating our top contributors, project builders, and success stories. Coming very soon!"
      />
    </div>
  );
}
