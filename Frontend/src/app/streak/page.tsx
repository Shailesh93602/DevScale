import { Metadata } from 'next';
import StreakContent from './StreakContent';

export const metadata: Metadata = {
  title: 'Your Streak',
  description:
    'Track your daily learning consistency and progress on EduScale.',
};

export default function StreakPage() {
  return <StreakContent />;
}
