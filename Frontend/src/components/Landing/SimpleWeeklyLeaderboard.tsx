'use client';

import React, { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaAward, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { ctaLinks } from '@/constants';
import { useAxiosGet } from '@/hooks/useAxios';

/**
 * Top players by competitive rating, from `GET /ratings/leaderboard`.
 *
 * This block has had three lives. First it carried five invented students at
 * real institutions with i.pravatar.cc portraits. Then it carried anonymous
 * "Top player — pts" placeholders behind a "Preview" badge, which was honest
 * but read as a mock-up on the one page a recruiter opens first. Now it shows
 * whatever the ratings table actually holds — including nothing, said plainly,
 * when nobody has been rated yet. No name on this component is ever typed in
 * by hand.
 */

export interface RatingLeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  user: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
}

/** Display name: "First Last" when both exist, else the username. */
export function displayName(entry: RatingLeaderboardEntry): string {
  const { firstName, lastName, username } = entry.user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return firstName || username;
}

const MedalIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <FaTrophy className="text-yellow-500 h-8 w-8" aria-hidden="true" />;
  } else if (rank === 2) {
    return <FaMedal className="h-8 w-8 text-gray-400" aria-hidden="true" />;
  } else if (rank === 3) {
    return <FaAward className="h-8 w-8 text-warning" aria-hidden="true" />;
  }
  return null;
};

interface WeeklyLeaderboardProps {
  isEmbedded?: boolean;
  /**
   * Pre-fetched entries. When supplied the component renders them and skips
   * its own request — used by tests, and available to a server component that
   * fetches ahead of time.
   */
  initialEntries?: RatingLeaderboardEntry[];
}

type LoadState = 'loading' | 'ready' | 'error';

const PODIUM_ORDER = [1, 0, 2] as const; // 2nd left, 1st centre, 3rd right
const LIMIT = 5;

const SimpleWeeklyLeaderboard: React.FC<WeeklyLeaderboardProps> = ({
  initialEntries,
}) => {
  const [entries, setEntries] = useState<RatingLeaderboardEntry[]>(
    initialEntries ?? [],
  );
  const [state, setState] = useState<LoadState>(
    initialEntries ? 'ready' : 'loading',
  );
  const [fetchLeaderboard] = useAxiosGet<RatingLeaderboardEntry[]>(
    '/ratings/leaderboard',
  );

  useEffect(() => {
    if (initialEntries) return;
    let cancelled = false;
    fetchLeaderboard({ params: { limit: LIMIT } })
      .then((res) => {
        if (cancelled) return;
        setEntries(Array.isArray(res?.data) ? res.data : []);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [fetchLeaderboard, initialEntries]);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3, LIMIT);

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-card px-4 py-6 text-card-foreground shadow-lg"
      data-leaderboard-source="ratings-api"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary2 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Rating Leaderboard
        </h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Top players by competitive rating, live from the Battle Zone.
        </p>
      </div>

      {state === 'loading' && (
        <div
          className="relative z-10 grid grid-cols-3 gap-4"
          role="status"
          aria-label="Loading leaderboard"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
              <div className="h-20 w-full animate-pulse rounded-t-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <p className="relative z-10 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          The leaderboard could not be loaded right now.
        </p>
      )}

      {state === 'ready' && entries.length === 0 && (
        <div className="relative z-10 rounded-lg border border-dashed border-border p-8 text-center">
          <FaTrophy
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium text-foreground">No rated players yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ratings appear after the first completed battle. The board is empty
            because nobody has played one, not because it is hidden.
          </p>
        </div>
      )}

      {state === 'ready' && entries.length > 0 && (
        <>
          {/* Podium */}
          <ul
            className="relative z-10 mb-8 grid grid-cols-3 gap-4"
            aria-label="Top three players"
          >
            {PODIUM_ORDER.map((idx) => {
              const entry = podium[idx];
              if (!entry) {
                return <li key={`empty-${idx}`} aria-hidden="true" />;
              }
              const rank = idx + 1;
              const bgColor =
                rank === 1
                  ? 'bg-yellow-500'
                  : rank === 2
                    ? 'bg-gray-400'
                    : 'bg-amber-600';
              const textColor =
                rank === 1
                  ? 'text-warning'
                  : rank === 2
                    ? 'text-muted-foreground'
                    : 'text-orange-500';
              const podiumHeight =
                rank === 1 ? 'h-32' : rank === 2 ? 'h-24' : 'h-16';

              return (
                <li key={entry.userId} className="flex flex-col items-center">
                  <div
                    aria-hidden="true"
                    className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted shadow-md"
                  >
                    <FaUser className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mb-2">
                    <MedalIcon rank={rank} />
                  </div>
                  <div className="relative w-full">
                    <div
                      className={`w-full ${podiumHeight} rounded-t-md ${bgColor} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-3xl font-bold text-white">
                        {rank}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 w-full rounded-md bg-muted/50 p-2 text-center shadow-sm">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {displayName(entry)}
                    </div>
                    <div className={`text-sm font-medium ${textColor}`}>
                      {entry.rating} rating
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {rest.length > 0 && (
            <ol
              className="relative z-10 space-y-2"
              start={4}
              aria-label="Players ranked fourth and fifth"
            >
              {rest.map((entry, i) => (
                <li
                  key={entry.userId}
                  className="flex items-center rounded-lg bg-muted/30 p-2 shadow-sm"
                >
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shadow-sm">
                    {i + 4}
                  </div>
                  <div
                    aria-hidden="true"
                    className="mr-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted shadow-sm"
                  >
                    <FaUser className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {displayName(entry)}
                    </div>
                  </div>
                  <div className="text-right text-xs font-semibold text-muted-foreground">
                    {entry.rating} rating
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

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
