'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Award, Flame, Swords, ArrowRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RoadmapCard, { RoadmapType } from '@/components/Roadmap/RoadmapCard';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import ActivityItem from '@/components/dashboard/ActivityItem';
import AchievementItem from '@/components/dashboard/AchievementItem';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import {
  useDashboard,
  DashboardSummary,
  RoadmapSummary,
} from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

// ─── sessionStorage SWR helpers ───────────────────────────────────────────────
const CACHE_KEY = 'dashboard:summary:v1';
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes — mirrors backend TTL

function readCache(): DashboardSummary | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as {
      data: DashboardSummary;
      ts: number;
    };
    if (Date.now() - ts > CACHE_MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: DashboardSummary) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

const mapToRoadmapType = (
  roadmap: RoadmapSummary,
  isEnrolled: boolean,
): RoadmapType => ({
  id: roadmap.id,
  title: roadmap.title,
  author: {
    id: roadmap.user?.id || 'anonymous',
    name: roadmap.user?.first_name
      ? `${roadmap.user.first_name}${roadmap.user.last_name ? ` ${roadmap.user.last_name}` : ''}`
      : roadmap.user?.username || 'Anonymous',
    profileImage: roadmap.user?.avatar_url,
  },
  thumbnail: roadmap.thumbnail,
  isEnrolled,
  likesCount: roadmap._count?.likes || 0,
  commentsCount: 0,
  bookmarksCount: roadmap._count?.user_roadmaps || 0,
  isLiked: Boolean(roadmap.likes?.length),
  isBookmarked: Boolean(roadmap.user_roadmaps?.length),
  description: (roadmap.description as string) || '',
  enrollmentCount: roadmap._count?.user_roadmaps || 0,
  rating: 0,
  progress: 0,
  steps: roadmap._count?.topics || 0,
  estimatedTime: '2-3 hours',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  difficulty: 'beginner' as const,
});

/** Shared section heading + link */
const SectionHeader = ({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref: string;
  linkLabel: string;
}) => (
  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    <Link
      href={linkHref}
      className="group flex items-center gap-1 text-xs font-semibold text-primary no-underline opacity-80 transition-opacity hover:opacity-100"
    >
      {linkLabel}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  </div>
);

/** Shared empty state */
const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  linkHref,
  linkLabel,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  linkHref: string;
  linkLabel: string;
}) => (
  <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <Link
      href={linkHref}
      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary no-underline hover:underline"
    >
      {linkLabel} <ArrowRight className="h-3 w-3" />
    </Link>
  </div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const DashboardPage: React.FC = () => {
  const { getDashboardSummary } = useDashboard();
  const { user } = useAuth();

  // Seed from sessionStorage immediately — no skeleton on repeat visits
  const [isLoading, setIsLoading] = useState(() => readCache() === null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(() =>
    readCache(),
  );
  // Track whether a background revalidation is in progress (for UX purposes)
  const revalidatingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      // If we already have stale data, revalidate silently in the background
      const isRevalidating = summary !== null;
      if (isRevalidating) {
        if (revalidatingRef.current) return; // already revalidating
        revalidatingRef.current = true;
      }

      try {
        if (!isRevalidating) setIsLoading(true);
        const res = await getDashboardSummary();
        if (cancelled) return;
        if (!res.success) {
          if (!isRevalidating) setIsLoading(false);
          return;
        }
        const fresh = res.data ?? null;
        setSummary(fresh);
        if (fresh) writeCache(fresh);
      } catch (err) {
        if (cancelled) return;
        logger.error('Error fetching dashboard summary:', err);
        // Only show error UI if we have nothing to show
        if (!isRevalidating) {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          revalidatingRef.current = false;
        }
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDashboardSummary]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const {
    stats,
    enrolledRoadmaps,
    recommendedRoadmaps,
    activities,
    achievements,
    streak,
    weeklyActivity,
  } = summary ?? {
    stats: null,
    enrolledRoadmaps: [],
    recommendedRoadmaps: [],
    activities: [],
    achievements: [],
    streak: null,
    weeklyActivity: [],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 md:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-7"
      >
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Welcome back
          {user?.first_name
            ? `, ${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
            : ''}
          ! Track your progress and continue learning.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Stats Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-3 xl:grid-cols-4">
          {[
            {
              title: 'Enrolled Roadmaps',
              value: stats?.enrolledRoadmaps || 0,
              icon: BookOpen,
              color: 'blue' as const,
            },
            {
              title: 'Topics Completed',
              value: stats?.totalTopicsCompleted || 0,
              description: `of ${stats?.totalTopics || 0} total`,
              icon: Award,
              color: 'green' as const,
            },
            {
              title: 'Current Streak',
              value: `${streak?.currentStreak || 0} days`,
              description: `Best: ${streak?.longestStreak || 0} days`,
              icon: Flame,
              color: 'orange' as const,
            },
            {
              title: 'Battle Rank',
              value: stats?.battleRank || 'Unranked',
              description: 'Compete to improve rank',
              icon: Swords,
              color: 'purple' as const,
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        {/* ── Main Column ───────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Enrolled Roadmaps */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <SectionHeader
              title="Your Learning Progress"
              linkHref="/career-roadmap"
              linkLabel="View All"
            />
            <div className="grid grid-cols-1 gap-4">
              {enrolledRoadmaps.slice(0, 2).map((roadmap, index) => (
                <RoadmapCard
                  key={roadmap.id}
                  roadmap={mapToRoadmapType(roadmap, true)}
                  index={index}
                />
              ))}
              {enrolledRoadmaps.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No Enrolled Roadmaps"
                  subtitle="Start your learning journey by enrolling in a roadmap"
                  linkHref="/career-roadmap"
                  linkLabel="Browse Roadmaps"
                />
              )}
            </div>
          </motion.div>

          {/* Recommended Roadmaps */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card p-5"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <SectionHeader
              title="Recommended For You"
              linkHref="/explore"
              linkLabel="Explore More"
            />
            <div className="grid grid-cols-1 gap-4">
              {recommendedRoadmaps.slice(0, 2).map((roadmap, index) => (
                <RoadmapCard
                  key={roadmap.id}
                  roadmap={mapToRoadmapType(roadmap, false)}
                  index={index}
                />
              ))}
              {recommendedRoadmaps.length === 0 && (
                <EmptyState
                  icon={Flame}
                  title="No Recommendations Yet"
                  subtitle="We'll suggest roadmaps based on your interests soon"
                  linkHref="/career-roadmap"
                  linkLabel="Browse All Roadmaps"
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Sidebar Column ────────────────────────────────── */}
        <div className="space-y-5">
          {/* Learning Streak */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <StreakCalendar
              currentStreak={streak?.currentStreak || 0}
              longestStreak={streak?.longestStreak || 0}
              thisWeek={weeklyActivity.map((day) => ({
                date: day.date,
                minutesSpent: day.minutesSpent,
              }))}
            />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-2xl border border-border bg-card"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm font-semibold text-foreground">
                Recent Activity
              </p>
              <Link
                href="/activity"
                className="text-xs font-semibold text-muted-foreground no-underline hover:text-foreground"
              >
                See All
              </Link>
            </div>
            <div className="px-5">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  id={activity.id}
                  type={'completed_topic'}
                  description={activity.action}
                  timestamp={activity.timestamp}
                />
              ))}
              {activities.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            custom={6}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-2xl border border-border bg-card"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm font-semibold text-foreground">
                Your Achievements
              </p>
              <Link
                href="/achievements"
                className="text-xs font-semibold text-muted-foreground no-underline hover:text-foreground"
              >
                View All
              </Link>
            </div>
            <div className="space-y-1 p-3">
              {achievements.map((achievement) => (
                <AchievementItem
                  key={achievement.id}
                  id={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.type}
                  unlockedAt={achievement.earned_at}
                />
              ))}
              {achievements.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No achievements yet
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
