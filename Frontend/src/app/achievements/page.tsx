import { Metadata } from 'next';
import AchievementsContent from './AchievementsContent';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'Every achievement you have unlocked on EduScale.',
};

// Auth-required (see lib/public-routes.ts), so an anonymous visitor is
// redirected to /auth/login and robots.txt already disallows the path — no
// noindex is needed here, and adding one would be contradictory (see robots.ts).
export default function AchievementsPage() {
  return <AchievementsContent />;
}
