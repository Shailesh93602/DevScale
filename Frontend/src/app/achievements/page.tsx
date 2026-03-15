import { Metadata } from 'next';
import AchievementsContent from './AchievementsContent';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Track your weekly progress and milestones on EduScale.',
};

export default function AchievementsPage() {
  return <AchievementsContent />;
}
