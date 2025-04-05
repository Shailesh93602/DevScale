import { useAxiosGet } from './useAxios';

export interface RoadmapAuthor {
  id: string;
  name: string;
  profileImage?: string;
}

export interface NextTopic {
  id: string;
  title: string;
  estimatedTime: string;
}

export interface RoadmapSocialData {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface BaseRoadmap extends RoadmapSocialData {
  id: string;
  title: string;
  author: RoadmapAuthor;
  thumbnail?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface EnrolledRoadmap extends BaseRoadmap {
  progress: number;
  lastAccessed: string;
  totalTopics: number;
  completedTopics: number;
  nextTopic?: NextTopic;
}

export interface RecommendedRoadmap extends BaseRoadmap {
  description: string;
  enrollmentCount: number;
  rating: number;
  topics: number;
  matchScore: number;
  matchReason: string;
}

export interface RoadmapsResponse {
  enrolled: EnrolledRoadmap[];
  recommended: RecommendedRoadmap[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export const useRoadmaps = () => {
  const [execute, state] =
    useAxiosGet<ApiResponse<RoadmapsResponse>>('/roadmaps');

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: execute,
  };
};
