'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Award, Flame, Swords, ArrowRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RoadmapCard, { RoadmapType } from '@/components/Roadmap/RoadmapCard';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import ActivityItem, {
  ActivityItemProps,
} from '@/components/dashboard/ActivityItem';
import AchievementItem, {
  AchievementItemProps,
} from '@/components/dashboard/AchievementItem';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  useDashboard,
  DashboardStats,
  Roadmap,
  EnrolledRoadmap,
  RecommendedRoadmap,
} from '@/hooks/useDashboard';
import { useStreak, WeeklyActivity } from '@/hooks/useStreak';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profileImage?: string;
  email: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  enrolledRoadmaps: Roadmap[];
  recommendedRoadmaps: Roadmap[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    thisWeek: WeeklyActivity[];
  } | null;
}

const isEnrolledRoadmap = (roadmap: Roadmap): roadmap is EnrolledRoadmap => {
  return 'progress' in roadmap;
};

const isRecommendedRoadmap = (
  roadmap: Roadmap,
): roadmap is RecommendedRoadmap => {
  return 'description' in roadmap;
};

const mapToRoadmapType = (
  roadmap: Roadmap,
  isEnrolled: boolean,
): RoadmapType => {
  const baseRoadmapData = {
    id: roadmap?.id,
    title: roadmap?.title,
    author: {
      id: roadmap?.author?.id || 'anonymous',
      name: roadmap?.author?.name || 'Anonymous',
      avatar: roadmap?.author?.profileImage,
    },
    thumbnail: roadmap?.thumbnail,
    isEnrolled,
    likesCount: roadmap?.likesCount || 0,
    commentsCount: roadmap?.commentsCount || 0,
    bookmarksCount: roadmap?.bookmarksCount || 0,
    isLiked: roadmap?.isLiked || false,
    isBookmarked: roadmap?.isBookmarked || false,
  };

  if (isEnrolled || 'progress' in roadmap) {
    return {
      ...baseRoadmapData,
      description:
        (roadmap as any).description || 'Track your progress in this roadmap',
      enrollmentCount: (roadmap as any).enrollmentCount || 0,
      rating: (roadmap as any).rating || 0,
      progress: (roadmap as any).progress || 0,
      steps: (roadmap as any).totalTopics || (roadmap as any).topics || 0,
      estimatedTime: (roadmap as any).nextTopic?.estimatedTime || '2-3 hours',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      difficulty: 'beginner' as const,
    };
  } else {
    return {
      ...baseRoadmapData,
      description: (roadmap as any).description || '',
      enrollmentCount: (roadmap as any).enrollmentCount || 0,
      rating: (roadmap as any).rating || 0,
      steps: (roadmap as any).topics || 0,
      estimatedTime: '2-3 hours',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      difficulty: 'beginner' as const,
    };
  }
};

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

const resolveData = (value: any) => {
  if (!value) return null;
  // If useAxios returns the full envelope, value.data is the first level
  // If the envelope itself has another .data property (double wrapping), we extract that too
  let data = value.data !== undefined ? value.data : value;

  // Double wrapping check: if current data is an object (not null/array) and has its own .data
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    data.data !== undefined
  ) {
    data = data.data;
  }
  return data;
};

const DashboardPage: React.FC = () => {
  const { getDashboardStats, getRoadmaps, getActivities, getAchievements } =
    useDashboard();
  const { getStreakStats, getWeeklyActivity } = useStreak();
  const { user, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrolledRoadmaps, setEnrolledRoadmaps] = useState<Roadmap[]>([]);
  const [recommendedRoadmaps, setRecommendedRoadmaps] = useState<Roadmap[]>([]);
  const [activities, setActivities] = useState<ActivityItemProps[]>([]);
  const [achievements, setAchievements] = useState<AchievementItemProps[]>([]);
  const [streakData, setStreakData] =
    useState<DashboardState['streakData']>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Using a more resilient pattern: if one fails, we still show the rest
        const [
          statsResponse,
          enrolledResponse,
          recommendedResponse,
          activitiesResponse,
          achievementsResponse,
          streakStatsResponse,
          weeklyActivityResponse,
        ] = await Promise.allSettled([
          getDashboardStats(),
          getRoadmaps({ params: { type: 'enrolled' } }),
          getRoadmaps({ params: { type: 'recommended' } }),
          getActivities(),
          getAchievements(),
          getStreakStats(),
          getWeeklyActivity(),
        ]);

        if (statsResponse.status === 'fulfilled') {
          const data = resolveData(statsResponse.value);
          console.log('Stats Resolved:', data);
          setStats(data);
        }
        if (enrolledResponse.status === 'fulfilled') {
          const data = resolveData(enrolledResponse.value);
          console.log('Enrolled Resolved:', data);
          setEnrolledRoadmaps(Array.isArray(data) ? data : []);
        }
        if (recommendedResponse.status === 'fulfilled') {
          const data = resolveData(recommendedResponse.value);
          console.log('Recommended Resolved:', data);
          setRecommendedRoadmaps(Array.isArray(data) ? data : []);
        }
        if (activitiesResponse.status === 'fulfilled') {
          const data = resolveData(activitiesResponse.value);
          console.log('Activities Resolved:', data);
          setActivities(Array.isArray(data) ? data : []);
        }
        if (achievementsResponse.status === 'fulfilled') {
          const data = resolveData(achievementsResponse.value);
          console.log('Achievements Resolved:', data);
          setAchievements(Array.isArray(data) ? data : []);
        }

        if (
          streakStatsResponse.status === 'fulfilled' &&
          weeklyActivityResponse.status === 'fulfilled'
        ) {
          const sData = resolveData(streakStatsResponse.value);
          const wData = resolveData(weeklyActivityResponse.value);
          console.log('Streak Stats Resolved:', sData);
          console.log('Weekly Activity Resolved:', wData);
          setStreakData({
            currentStreak: sData?.currentStreak,
            longestStreak: sData?.longestStreak,
            thisWeek: Array.isArray(wData) ? wData : [],
          });
        }
      } catch (err) {
        logger.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    isAuthenticated,
    getDashboardStats,
    getRoadmaps,
    getActivities,
    getAchievements,
    getStreakStats,
    getWeeklyActivity,
  ]);

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
              value: `${streakData?.currentStreak || 0} days`,
              description: `Best: ${streakData?.longestStreak || 0} days`,
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
              {enrolledRoadmaps
                ?.slice(0, 2)
                .map((roadmap, index) => (
                  <RoadmapCard
                    key={roadmap.id}
                    roadmap={mapToRoadmapType(roadmap, true)}
                    index={index}
                  />
                ))}
              {enrolledRoadmaps?.length === 0 && (
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
              {recommendedRoadmaps
                ?.slice(0, 2)
                .map((roadmap, index) => (
                  <RoadmapCard
                    key={roadmap.id}
                    roadmap={mapToRoadmapType(roadmap, false)}
                    index={index}
                  />
                ))}
              {recommendedRoadmaps?.length === 0 && (
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
              currentStreak={streakData?.currentStreak || 0}
              longestStreak={streakData?.longestStreak || 0}
              thisWeek={
                streakData?.thisWeek?.map((day: WeeklyActivity) => ({
                  date: day.date,
                  minutesSpent: day.minutesLearned,
                })) || []
              }
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
              {activities?.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
              {activities?.length === 0 && (
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
              {achievements?.map((achievement) => (
                <AchievementItem key={achievement.id} {...achievement} />
              ))}
              {achievements?.length === 0 && (
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
