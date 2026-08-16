import React from 'react';
import { FaTrophy, FaMedal, FaAward, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { ctaLinks } from '@/constants';

// Illustrative placeholder rankings.
//
// This block used to carry five invented students ("Abhinav — IIT Bombay",
// 1540 pts) with i.pravatar.cc stock portraits. Even behind the "Preview"
// badge that reads as real social proof: real institutions, real-looking
// people, precise-looking scores, none of it backed by a single row in the
// database. Anonymous rank labels keep the layout demonstration honest, and
// drop a third-party image host from the landing page's critical path.
const leaderboardData = [
  { rank: 1, name: 'Top player' },
  { rank: 2, name: 'Runner-up' },
  { rank: 3, name: 'Third place' },
  { rank: 4, name: 'Fourth place' },
  { rank: 5, name: 'Fifth place' },
];

// Medal icon component
const MedalIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <FaTrophy className="text-yellow-500 h-8 w-8" />;
  } else if (rank === 2) {
    return <FaMedal className="h-8 w-8 text-gray-400" />;
  } else if (rank === 3) {
    return <FaAward className="h-8 w-8 text-warning" />;
  }
  return null;
};

interface WeeklyLeaderboardProps {
  isEmbedded?: boolean;
}

const SimpleWeeklyLeaderboard: React.FC<WeeklyLeaderboardProps> = () => {
  // Top 3 users for podium
  const toppers = leaderboardData.slice(0, 3);

  // Correct order: 2nd left, 1st center, 3rd right
  const podiumOrder = [1, 0, 2];

  return (
    <div className="relative overflow-hidden rounded-xl bg-card px-4 py-6 text-card-foreground shadow-lg">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary2 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">
            Weekly Leaderboard
          </h2>
          <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Preview
          </span>
        </div>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          A preview of how weekly rankings appear — compete in the Battle Zone
          to claim your spot.
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
              ? 'text-warning'
              : user.rank === 2
                ? 'text-muted-foreground'
                : 'text-orange-500';

          // Determine height based on rank
          const podiumHeight =
            user.rank === 1 ? 'h-32' : user.rank === 2 ? 'h-24' : 'h-16';

          return (
            <div key={user.rank} className="flex flex-col items-center">
              {/* Avatar */}
              <div
                aria-hidden="true"
                className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted shadow-md"
              >
                <FaUser className="h-6 w-6 text-muted-foreground" />
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
              <div className="mt-2 w-full rounded-md bg-muted/50 p-2 text-center shadow-sm">
                <div className="truncate text-sm font-semibold text-foreground">
                  {user.name}
                </div>
                <div className={`text-sm font-medium ${textColor}`}>
                  &mdash; pts
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
            className="flex items-center rounded-lg bg-muted/30 p-2 shadow-sm"
          >
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shadow-sm">
              {user.rank}
            </div>
            <div
              aria-hidden="true"
              className="mr-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted shadow-sm"
            >
              <FaUser className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">
                {user.name}
              </div>
            </div>
            <div className="text-right text-xs font-semibold text-muted-foreground">
              &mdash; pts
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="relative z-10 mt-4 text-center">
        <Link
          href={ctaLinks.battleZone.href}
          className="text-sm font-medium text-primary transition-colors hover:text-primary2"
        >
          {ctaLinks.battleZone.name} →
        </Link>
      </div>
    </div>
  );
};

export default SimpleWeeklyLeaderboard;
