import { useAxiosGet } from './useAxios';
import { ActivityItemProps } from '@/components/dashboard/ActivityItem';
import { AchievementItemProps } from '@/components/dashboard/AchievementItem';

export interface DashboardStats {
  enrolledRoadmaps: number;
  totalTopics: number;
  totalTopicsCompleted: number;
  totalHoursSpent: number;
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
  nextTopic?: {
    estimatedTime: string;
  };
}

export interface RecommendedRoadmap extends BaseRoadmap {
  description: string;
  enrollmentCount: number;
  rating: number;
  topics: number;
}

export type Roadmap = EnrolledRoadmap | RecommendedRoadmap;

export const useDashboard = () => {
  const [getDashboardStats] = useAxiosGet<DashboardStats>('/dashboard/stats');
  const [getRoadmaps] = useAxiosGet<{ data: { data: Roadmap[] } }>('/roadmaps');
  const [getActivities] = useAxiosGet<{ data: ActivityItemProps[] }>(
    '/activities',
  );
  const [getAchievements] = useAxiosGet<{ data: AchievementItemProps[] }>(
    '/achievements',
  );

  return {
    getDashboardStats,
    getRoadmaps,
    getActivities,
    getAchievements,
  };
};
