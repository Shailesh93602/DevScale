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

export const useDashboard = () => {
  const [getDashboardStats] = useAxiosGet<DashboardStats>('/dashboard/stats');
  const [getRoadmaps] = useAxiosGet<Roadmap[]>('/roadmaps');
  const [getActivities] = useAxiosGet<ActivityItemProps[]>(
    '/dashboard/activities',
  );
  const [getAchievements] = useAxiosGet<AchievementItemProps[]>(
    '/dashboard/achievements',
  );

  return {
    getDashboardStats,
    getRoadmaps,
    getActivities,
    getAchievements,
  };
};
