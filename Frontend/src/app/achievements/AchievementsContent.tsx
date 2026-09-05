'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import AchievementItem from '@/components/dashboard/AchievementItem';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard, type AchievementRecord } from '@/hooks/useDashboard';
import { logger } from '@/lib/logger';

type Status = 'loading' | 'ready' | 'error';

/**
 * The full achievements list for the signed-in user.
 *
 * ED-8: this route was reachable from the landing page's "Achievements"
 * feature card and from the dashboard's "View All" link, and rendered a
 * "Coming Soon" placeholder. The data it needed already existed —
 * `GET /dashboard/achievements` returns every Achievement row for the user —
 * so the page now reads it. The empty state is honest: it says nothing has
 * been earned yet and points at the dashboard, rather than promising a
 * feature that is not there.
 */
export default function AchievementsContent() {
  const { getAchievements } = useDashboard();
  const [status, setStatus] = useState<Status>('loading');
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getAchievements();
      if (!res.success) {
        setStatus('error');
        return;
      }
      setAchievements(Array.isArray(res.data) ? res.data : []);
      setStatus('ready');
    } catch (err) {
      logger.error('Error fetching achievements:', err);
      setStatus('error');
    }
  }, [getAchievements]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-foreground">Achievements</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Everything you have unlocked on EduScale, newest first.
        </p>
      </motion.div>

      {status === 'loading' && (
        <div
          className="space-y-2"
          data-testid="achievements-loading"
          aria-busy="true"
          aria-label="Loading achievements"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="Could not load your achievements"
          message="Something went wrong while fetching them. Please try again."
          onRetry={load}
          data-testid="achievements-error"
        />
      )}

      {status === 'ready' && achievements.length === 0 && (
        <div data-testid="achievements-empty">
          <EmptyState
            icon={Trophy}
            title="No achievements yet"
            description="You haven't earned any achievements so far. Everything you unlock will be listed here; your streak and progress are on your Dashboard."
          />
          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-primary no-underline hover:underline"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      {status === 'ready' && achievements.length > 0 && (
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold text-foreground">
              {achievements.length}{' '}
              {achievements.length === 1 ? 'achievement' : 'achievements'}
            </p>
          </div>
          <ul className="space-y-1 p-3" data-testid="achievements-list">
            {achievements.map((achievement) => (
              <li key={achievement.id} className="list-none">
                <AchievementItem
                  id={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.type}
                  unlockedAt={achievement.earned_at}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
