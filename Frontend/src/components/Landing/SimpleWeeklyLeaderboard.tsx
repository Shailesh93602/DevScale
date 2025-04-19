import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import Link from 'next/link';

// Sample leaderboard data
const leaderboardData = [
  {
    rank: 1,
    name: 'Sarthak Sharma',
    points: 2890,
    college: 'IIT Bombay',
    avatar: 'https://i.pravatar.cc/150?img=1', // Using pravatar.cc for placeholder avatars
  },
  {
    rank: 2,
    name: 'Pranav Agarwal',
    points: 2780,
    college: 'IIT Kharagpur',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    rank: 3,
    name: 'Aman Singh',
    points: 2690,
    college: 'BITS Pilani',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    rank: 4,
    name: 'Priya M.',
    points: 2610,
    college: 'IIT Delhi',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    rank: 5,
    name: 'Shailesh Chaudhari',
    points: 2580,
    college: 'VIT Vellore',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Medal icon component
const MedalIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <FaTrophy className="h-8 w-8 text-yellow-500" />;
  } else if (rank === 2) {
    return <FaMedal className="h-8 w-8 text-gray-400" />;
  } else if (rank === 3) {
    return <FaAward className="h-8 w-8 text-amber-600" />;
  }
  return null;
};

interface WeeklyLeaderboardProps {
  isEmbedded?: boolean;
}

const SimpleWeeklyLeaderboard: React.FC<WeeklyLeaderboardProps> = ({
  isEmbedded = false,
}) => {
  // Top 3 users for podium
  const toppers = leaderboardData.slice(0, 3);

  // Correct order: 2nd left, 1st center, 3rd right
  const podiumOrder = [1, 0, 2];

  return (
    <div className="relative overflow-hidden rounded-xl bg-card px-4 py-6 text-card-foreground dark:bg-[#1e293b] dark:text-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary2 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6 text-center">
        <h2 className="text-2xl font-bold">Weekly Leaderboard</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground dark:text-gray-300">
          Compete, climb, and claim your spot among the best engineers.
        </p>
      </div>

      {/* Simple Podium display */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {podiumOrder.map((podiumIdx) => {
          const user = toppers[podiumIdx];

          // Determine colors based on rank
          const bgColor =
            user.rank === 1
              ? 'bg-yellow-500'
              : user.rank === 2
                ? 'bg-gray-400'
                : 'bg-amber-600';

          const textColor =
            user.rank === 1
              ? 'text-yellow-500 dark:text-yellow-300'
              : user.rank === 2
                ? 'text-gray-500 dark:text-gray-300'
                : 'text-amber-600 dark:text-amber-400';

          // Determine height based on rank
          const podiumHeight =
            user.rank === 1 ? 'h-32' : user.rank === 2 ? 'h-24' : 'h-16';

          return (
            <div key={user.rank} className="flex flex-col items-center">
              {/* Avatar */}
              <div className="mb-2 h-14 w-14 overflow-hidden rounded-full border-2 border-gray-200/50 shadow-md dark:border-white/50">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  unoptimized={user.avatar.startsWith('http')}
                />
              </div>

              {/* Medal */}
              <div className="mb-2">
                <MedalIcon rank={user.rank} />
              </div>

              {/* Podium */}
              <div className="relative w-full">
                <div
                  className={`w-full ${podiumHeight} rounded-t-md ${bgColor} flex items-center justify-center shadow-md`}
                >
                  <span className="text-3xl font-bold text-white">
                    {user.rank}
                  </span>
                </div>
              </div>

              {/* User info */}
              <div className="mt-2 w-full rounded-md bg-gray-100/90 p-2 text-center shadow-sm dark:bg-white/10">
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className={`text-sm font-medium ${textColor}`}>
                  {user.points.toLocaleString()} pts
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.college}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional leaderboard entries */}
      <div className="relative z-10 space-y-2">
        {leaderboardData.slice(3, 5).map((user) => (
          <div
            key={user.rank}
            className="flex items-center rounded-lg bg-gray-100/80 p-2 shadow-sm dark:bg-white/5"
          >
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
              {user.rank}
            </div>
            <div className="mr-2">
              <Image
                src={user.avatar}
                alt={user.name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full border border-gray-300 object-cover shadow-sm dark:border-gray-700"
                unoptimized={user.avatar.startsWith('http')}
              />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {user.college}
              </div>
            </div>
            <div className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
              {user.points.toLocaleString()} pts
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="relative z-10 mt-4 text-center">
        <Link
          href="/battle-zone"
          className="dark:text-primary-light text-sm font-medium text-primary hover:text-primary2 dark:hover:text-primary"
        >
          Will you make it to the top? →
        </Link>
      </div>
    </div>
  );
};

export default SimpleWeeklyLeaderboard;
