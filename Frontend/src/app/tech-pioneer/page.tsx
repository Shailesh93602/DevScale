import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Tech Pioneer',
  description:
    'Coding courses, project development, AI & ML tracks, and virtual internships — coming soon.',
};

// The sub-routes (coding-courses, project-development, ai-ml-courses,
// virtual-internship) don't exist yet — previously this page linked straight to
// 404s. Show an honest Coming Soon until those tracks are built.
export default function TechPioneerPage() {
  return (
    <ComingSoon
      title="Tech Pioneer"
      description="Coding courses, project development, AI & ML tracks, and virtual internships are on the way. Check back soon."
    />
  );
}
