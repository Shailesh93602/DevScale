import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Mastermind Forge',
  description:
    'Interview prep, resume building, aptitude training, mentorship, and more — coming soon.',
  // Placeholder page: real, honest, and deliberately not indexed until the
  // features behind it exist. Kept crawlable so the tag can be read.
  robots: { index: false, follow: true },
};

// None of the sub-routes exist yet — this page previously linked to 9 dead
// 404s. Show an honest Coming Soon until those features are built.
export default function MastermindForgePage() {
  return (
    <ComingSoon
      title="Mastermind Forge"
      description="Interview & presentation training, resume building, aptitude & reasoning prep, mentorship, and more are on the way. Check back soon."
    />
  );
}
