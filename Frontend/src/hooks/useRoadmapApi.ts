import { useAxiosGet } from './useAxios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

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
  slug?: string | null;
  title: string;
  author: RoadmapAuthor;
  thumbnail?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnrolledRoadmap extends BaseRoadmap {
  progress: number;
  lastAccessed: string;
  totalTopics: number;
  completedTopics: number;
  nextTopic?: NextTopic;
  user?: {
    full_name?: string | null;
    avatar_url?: string | null;
    username?: string;
  };
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

export interface RoadmapFilters {
  categories?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  sortBy?: 'popular' | 'recent' | 'rating' | 'enrolled';
  search?: string;
  page?: number;
  limit?: number;
  type?: 'featured' | 'trending' | 'all';
}

export const useRoadmaps = (filters?: RoadmapFilters) => {
  const [execute, state] = useAxiosGet<BaseRoadmap[]>('/roadmaps');

  const fetchRoadmaps = async () => {
    try {
      // Convert filters to URLSearchParams format
      const params = new URLSearchParams();

      if (filters) {
        if (filters.categories && filters.categories.length > 0) {
          params.append('category', filters.categories.join(','));
        }

        if (filters.difficulty && filters.difficulty !== 'all') {
          params.append('difficulty', filters.difficulty);
        }

        if (filters.sortBy) {
          params.append('sort', filters.sortBy);
        }

        if (filters.search) {
          params.append('search', filters.search);
        }

        if (filters.page) {
          params.append('page', filters.page.toString());
        }

        if (filters.limit) {
          params.append('limit', filters.limit.toString());
        }

        if (filters.type) {
          params.append('type', filters.type);
        }
      }

      const response = await execute({ params });
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to fetch roadmaps',
      );
      throw error;
    }
  };

  return {
    data: state.data,
    meta: state.meta,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchRoadmaps,
  };
};

export const useRoadmapById = (id: string) => {
  const [execute, state] = useAxiosGet<BaseRoadmap>(`/roadmaps/${id}`);

  const fetchRoadmap = async () => {
    try {
      const response = await execute();
      return response;
    } catch (error) {
      toast.error('Failed to fetch roadmap');
      throw error;
    }
  };

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchRoadmap,
  };
};

export const useRoadmapCategories = () => {
  const [execute, state] = useAxiosGet<
    { id: string; name: string; icon?: string; description?: string }[]
  >('/roadmaps/categories');

  const fetchCategories = async () => {
    try {
      const response = await execute();
      return response;
    } catch (error) {
      toast.error('Failed to fetch categories');
      throw error;
    }
  };

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchCategories,
  };
};
