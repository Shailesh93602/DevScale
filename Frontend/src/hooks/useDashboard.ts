import { useAxiosGet } from './useAxios';
import { ActivityItemProps } from '@/components/dashboard/ActivityItem';
import { AchievementItemProps } from '@/components/dashboard/AchievementItem';

export interface DashboardStats {
  enrolledRoadmaps: number;
  totalTopics: number;
  totalTopicsCompleted: number;
  totalHoursSpent: number;
  averageProgress: number;
  battleRank?: string | number;
}

export interface BaseRoadmap {
  id: string;
  title: string;
  description?: string;
  author?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  thumbnail?: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface EnrolledRoadmap extends BaseRoadmap {
  progress: number;
  totalTopics: number;
  steps: number;
  nextTopic?: {
    estimatedTime: string;
  };
}

export interface RecommendedRoadmap extends BaseRoadmap {
  description: string;
  enrollmentCount: number;
  rating: number;
  topics: number;
  steps: number;
}

export type Roadmap = EnrolledRoadmap | RecommendedRoadmap;

export interface RoadmapSummary {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  _count?: {
    likes: number;
    user_roadmaps: number;
    topics: number;
  };
  likes?: { id: string }[];
  user_roadmaps?: { id: string }[];
  [key: string]: unknown;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export interface AchievementRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  criteria: Record<string, unknown>;
  earned_at: string;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  timezone: string;
}

export interface WeeklyActivityItem {
  date: string;
  minutesSpent: number;
  activityType: string;
}

export interface DashboardSummary {
  stats: DashboardStats & { battleRank?: string };
  enrolledRoadmaps: RoadmapSummary[];
  recommendedRoadmaps: RoadmapSummary[];
  activities: ActivityLog[];
  achievements: AchievementRecord[];
  streak: StreakSummary | null;
  weeklyActivity: WeeklyActivityItem[];
}

export const useDashboard = () => {
  const [getDashboardStats] = useAxiosGet<DashboardStats>('/dashboard/stats');
  const [getRoadmaps] = useAxiosGet<Roadmap[]>('/roadmaps');
  const [getActivities] = useAxiosGet<ActivityItemProps[]>(
    '/dashboard/activities',
  );
  const [getAchievements] = useAxiosGet<AchievementItemProps[]>(
    '/dashboard/achievements',
  );
  const [getDashboardSummary] =
    useAxiosGet<DashboardSummary>('/dashboard/summary');

  return {
    getDashboardStats,
    getRoadmaps,
    getActivities,
    getAchievements,
    getDashboardSummary,
  };
};
