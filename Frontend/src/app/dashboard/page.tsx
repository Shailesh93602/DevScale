'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Award, Hourglass, Flame } from 'lucide-react';
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
import { useSelector } from 'react-redux';
import { getLoggedInUser } from '@/lib/features/user/userSlice';

interface User {
  id: string;
  username: string;
  fullName: string;
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

  if (isEnrolledRoadmap(roadmap)) {
    return {
      ...baseRoadmapData,
      description: 'Track your progress in this roadmap',
      enrollmentCount: 0,
      rating: 0,
      progress: roadmap.progress,
      steps: roadmap.totalTopics,
      estimatedTime: roadmap.nextTopic?.estimatedTime || '2-3 hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      difficulty: 'beginner' as const,
    };
  } else {
    return {
      ...baseRoadmapData,
      description: roadmap.description,
      enrollmentCount: roadmap.enrollmentCount,
      rating: roadmap.rating,
      steps: roadmap.topics,
      estimatedTime: '2-3 hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      difficulty: 'beginner' as const,
    };
  }
};

const DashboardPage: React.FC = () => {
  const { getDashboardStats, getRoadmaps, getActivities, getAchievements } =
    useDashboard();

  const { getStreakStats, getWeeklyActivity } = useStreak();
  const [fetchUser] = useAxiosGet<User>('/user');
  const user = useSelector(getLoggedInUser);

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
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [
          statsResponse,
          enrolledResponse,
          recommendedResponse,
          activitiesResponse,
          achievementsResponse,
          streakStatsResponse,
          weeklyActivityResponse,
        ] = await Promise.all([
          getDashboardStats(),
          getRoadmaps({ params: { type: 'enrolled' } }),
          getRoadmaps({ params: { type: 'recommended' } }),
          getActivities(),
          getAchievements(),
          getStreakStats(),
          getWeeklyActivity(),
        ]);

        console.log('here ===========', enrolledResponse);

        setStats(statsResponse?.data);
        setEnrolledRoadmaps(enrolledResponse?.data?.data?.data || []);
        setRecommendedRoadmaps(recommendedResponse?.data?.data?.data || []);
        setActivities(activitiesResponse?.data?.data || []);
        setAchievements(achievementsResponse?.data?.data || []);

        // Format streak data
        const weeklyActivity = weeklyActivityResponse?.data?.data;

        setStreakData({
          currentStreak: streakStatsResponse?.data?.currentStreak,
          longestStreak: streakStatsResponse?.data?.longestStreak,
          thisWeek: weeklyActivity,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    fetchUser,
    getDashboardStats,
    getRoadmaps,
    getActivities,
    getAchievements,
    getStreakStats,
    getWeeklyActivity,
  ]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-foreground"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-muted-foreground"
        >
          Welcome back, {user?.fullName}! Track your progress and continue
          learning.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-3 xl:grid-cols-4">
          <StatCard
            title="Enrolled Roadmaps"
            value={stats?.enrolledRoadmaps || 0}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Topics Completed"
            value={stats?.totalTopicsCompleted || 0}
            description={`out of ${stats?.totalTopics || 0} total topics`}
            icon={Award}
            color="green"
          />
          <StatCard
            title="Current Streak"
            value={`${streakData?.currentStreak || 0} days`}
            description={`Longest: ${streakData?.longestStreak || 0} days`}
            icon={Flame}
            color="orange"
          />
          <StatCard
            title="Learning Time"
            value={`${stats?.totalHoursSpent || 0}h`}
            description="Total time spent learning"
            icon={Hourglass}
            color="purple"
          />
        </div>

        {/* Main Content Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Enrolled Roadmaps Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-lg bg-card p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Your Learning Progress
              </h2>
              <Link
                href="/career-roadmap"
                className="hover:text-primary/80 text-sm font-medium text-primary"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {enrolledRoadmaps
                ?.filter(isEnrolledRoadmap)
                .slice(0, 2)
                .map((roadmap, index) => (
                  <RoadmapCard
                    key={roadmap.id}
                    roadmap={mapToRoadmapType(roadmap, true)}
                    index={index}
                  />
                ))}
              {enrolledRoadmaps?.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
                  <BookOpen className="mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">
                    No Enrolled Roadmaps
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Start your learning journey by enrolling in a roadmap
                  </p>
                  <Link
                    href="/career-roadmap"
                    className="hover:text-primary/80 text-sm font-medium text-primary"
                  >
                    Browse Roadmaps
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recommended Roadmaps Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-lg bg-card p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Recommended For You
              </h2>
              <Link
                href="/explore"
                className="hover:text-primary/80 text-sm font-medium text-primary"
              >
                Explore More
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {recommendedRoadmaps
                ?.filter(isRecommendedRoadmap)
                .slice(0, 2)
                .map((roadmap, index) => (
                  <RoadmapCard
                    key={roadmap.id}
                    roadmap={mapToRoadmapType(roadmap, false)}
                    index={index}
                  />
                ))}
              {recommendedRoadmaps?.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
                  <Flame className="mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">
                    No Recommendations Yet
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    We&apos;ll suggest roadmaps based on your interests soon
                  </p>
                  <Link
                    href="/career-roadmap"
                    className="hover:text-primary/80 text-sm font-medium text-primary"
                  >
                    Browse All Roadmaps
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Learning Streak Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
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

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-lg bg-card p-4 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Recent Activity
              </h3>
              <Link
                href="/activity"
                className="hover:text-primary/80 text-sm font-medium text-primary"
              >
                See All
              </Link>
            </div>
            <div className="space-y-1">
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

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-lg bg-card p-4 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Your Achievements
              </h3>
              <Link
                href="/achievements"
                className="hover:text-primary/80 text-sm font-medium text-primary"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
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
