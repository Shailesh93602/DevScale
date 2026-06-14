import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Track your progress and milestones on EduScale.',
};

// The standalone weekly-progress charts were placeholder data not tied to a real
// backend (this route is unlinked). Real achievements + progress already live on
// the Dashboard and Profile; show an honest Coming Soon here until the dedicated
// analytics view is wired to live data.
export default function AchievementsPage() {
  return (
    <ComingSoon
      title="Progress Analytics Coming Soon"
      description="A detailed weekly-progress and achievements dashboard is on the way. For now, see your streak, XP, enrolled roadmaps, and badges on your Dashboard and Profile."
    />
  );
}
