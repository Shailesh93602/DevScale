import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { useAxiosGet } from '@/hooks/useAxios';
import { useIntersection } from '@/hooks/useIntersection';
import { useRoadmaps, RoadmapFilters } from '@/hooks/useRoadmapApi';
import { logger } from '@/lib/logger';
import type { RoadmapType } from '@/components/Roadmap/RoadmapCard';

interface RoadmapCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export const ITEMS_PER_PAGE = 9;

/** Featured + trending lists for the Discover tab, fetched only while it is active. */
function useDiscoverRoadmaps() {
  const [featuredRoadmaps, setFeaturedRoadmaps] = useState<RoadmapType[]>([]);
  const [trendingRoadmaps, setTrendingRoadmaps] = useState<RoadmapType[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  const [getFeaturedRoadmaps] = useAxiosGet<RoadmapType[]>('/roadmaps');
  const [getTrendingRoadmaps] = useAxiosGet<RoadmapType[]>('/roadmaps');

  // Stable refs so the fetch effect does not re-run when the hooks return new functions
  const getFeaturedRoadmapsRef = useRef(getFeaturedRoadmaps);
  const getTrendingRoadmapsRef = useRef(getTrendingRoadmaps);
  useEffect(() => {
    getFeaturedRoadmapsRef.current = getFeaturedRoadmaps;
  });
  useEffect(() => {
    getTrendingRoadmapsRef.current = getTrendingRoadmaps;
  });

  return {
    featuredRoadmaps,
    trendingRoadmaps,
    isFeaturedLoading,
    isTrendingLoading,
    load: () => {
      let cancelled = false;
      const fetchFeaturedAndTrending = async () => {
        setIsFeaturedLoading(true);
        setIsTrendingLoading(true);
        try {
          const [featuredResponse, trendingResponse] = await Promise.all([
            getFeaturedRoadmapsRef.current({ params: { type: 'featured' } }),
            getTrendingRoadmapsRef.current({ params: { type: 'trending' } }),
          ]);
          if (!cancelled) {
            setFeaturedRoadmaps(featuredResponse?.data || []);
            setTrendingRoadmaps(trendingResponse?.data || []);
          }
        } catch (error) {
          if (!cancelled) {
            logger.error('Error fetching featured/trending roadmaps:', error);
          }
        } finally {
          if (!cancelled) {
            setIsFeaturedLoading(false);
            setIsTrendingLoading(false);
          }
        }
      };
      fetchFeaturedAndTrending();
      // Mark as cancelled if the tab changes before completion
      return () => {
        cancelled = true;
      };
    },
  };
}

function useRoadmapCategories() {
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [getCategories] = useAxiosGet<RoadmapCategory[]>(
    '/roadmaps/categories',
  );

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await getCategories();
      setCategories(response?.data ?? []);
    } catch (error) {
      logger.error('Error fetching categories:', error);
      toast.error(
        'Unable to load roadmap categories. Please check your internet connection and refresh the page.',
      );
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  return { categories, isCategoriesLoading, fetchCategories };
}

function filterForTab(
  roadmaps: RoadmapType[],
  activeTab: string,
  currentUserId: string | undefined,
) {
  if (activeTab === 'enrolled') {
    return roadmaps?.filter((roadmap) => roadmap?.isEnrolled);
  }
  if (activeTab === 'created') {
    return roadmaps?.filter((roadmap) => roadmap?.author?.id === currentUserId);
  }
  if (activeTab === 'bookmarked') {
    return roadmaps?.filter((roadmap) => roadmap?.isBookmarked);
  }
  return roadmaps;
}

/** Search, difficulty, sort and category filters; every change restarts paging via `resetResults`. */
function useRoadmapFilterState(resetResults: () => void) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Non-pagination params (used to detect filter changes)
  const filters: RoadmapFilters = useMemo(() => {
    return {
      categories: selectedCategories,
      difficulty: difficultyFilter as
        | 'beginner'
        | 'intermediate'
        | 'advanced'
        | 'all',
      sortBy: sortBy as 'popular' | 'recent' | 'rating' | 'enrolled',
      search: searchQuery,
      limit: ITEMS_PER_PAGE,
    };
  }, [selectedCategories, difficultyFilter, sortBy, searchQuery]);

  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        resetResults();
      }, 500),
    [resetResults],
  );

  const handleDifficultyChange = useCallback(
    (value: string) => {
      setDifficultyFilter(value);
      resetResults();
    },
    [resetResults],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value);
      resetResults();
    },
    [resetResults],
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategories((prev) => {
        const newCategories = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];
        resetResults();
        return newCategories;
      });
    },
    [resetResults],
  );

  const handleRemoveCategory = (categoryId: string) => {
    resetResults();
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([]);
    resetResults();
  }, [resetResults]);

  return {
    filters,
    selectedCategories,
    difficultyFilter,
    sortBy,
    handleSearch,
    handleDifficultyChange,
    handleSortChange,
    handleCategoryChange,
    handleRemoveCategory,
    handleClearCategories,
  };
}

/** State, data loading and handlers behind the career-roadmap dashboard. */
export function useRoadmapDashboard(
  loadMoreRef: RefObject<HTMLDivElement | null>,
) {
  const currentUser = useSelector(
    (state: { user: { user: { id?: string } } }) => state?.user?.user,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapType[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);

  const resetResults = useCallback(() => {
    setPage(1);
    setRoadmaps([]);
  }, []);
  const f = useRoadmapFilterState(resetResults);
  const { filters } = f;

  const filtersWithPage: RoadmapFilters = useMemo(() => {
    return { ...filters, page };
  }, [filters, page]);

  const {
    data: roadmapsData,
    meta: roadmapsMeta,
    isLoading,
    refetch: fetchRoadmapsData,
  } = useRoadmaps(activeTab !== 'discover' ? filtersWithPage : undefined);

  const { categories, isCategoriesLoading, fetchCategories } =
    useRoadmapCategories();
  const discover = useDiscoverRoadmaps();

  const isIntersecting = useIntersection(loadMoreRef);
  const router = useRouter();

  // Check URL parameters for create modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('create') === 'true') {
        setIsCreateModalOpen(true);
      }
    }
  }, []);

  // Fetch categories only once on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Featured/trending only on the discover tab; depends ONLY on activeTab
  useEffect(() => {
    if (activeTab !== 'discover') return;
    return discover.load();
  }, [activeTab]);

  // Infinite scroll — ref guard avoids re-triggering when state resets
  useEffect(() => {
    if (
      isIntersecting &&
      hasMore &&
      !isLoadingMoreRef.current &&
      activeTab !== 'discover'
    ) {
      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, activeTab]);

  // Update roadmaps state when data changes
  useEffect(() => {
    if (roadmapsData) {
      const actualRoadmaps: RoadmapType[] =
        (roadmapsData as RoadmapType[]) || [];
      if (page === 1) {
        setRoadmaps(actualRoadmaps);
      } else {
        setRoadmaps((prev) => [...prev, ...actualRoadmaps]);
      }

      const meta = roadmapsMeta as { hasNextPage?: boolean } | null | undefined;
      if (meta && typeof meta.hasNextPage === 'boolean') {
        setHasMore(meta.hasNextPage);
      } else {
        setHasMore(actualRoadmaps.length === ITEMS_PER_PAGE);
      }
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [roadmapsData, roadmapsMeta, page]);

  // Fetch roadmaps when filters change (pagination is handled by infinite scroll)
  useEffect(() => {
    if (activeTab !== 'discover') {
      fetchRoadmapsData();
    }
  }, [activeTab, filters]);

  // Fetch next page when page changes (separate from filter changes)
  useEffect(() => {
    if (page > 1 && activeTab !== 'discover') {
      fetchRoadmapsData();
    }
  }, [page]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      resetResults();
      setHasMore(false);
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    },
    [resetResults],
  );

  const handleCreateSuccess = useCallback(() => {
    resetResults();
    fetchRoadmapsData();
    toast.success('Roadmap created successfully!');
  }, [fetchRoadmapsData, resetResults]);

  const filteredRoadmaps = useMemo(
    () => filterForTab(roadmaps, activeTab, currentUser?.id),
    [roadmaps, activeTab],
  );

  return {
    router,
    isCreateModalOpen,
    setIsCreateModalOpen,
    categories,
    isCategoriesLoading,
    selectedCategories: f.selectedCategories,
    hasMore,
    setPage,
    activeTab,
    difficultyFilter: f.difficultyFilter,
    sortBy: f.sortBy,
    isLoading,
    filteredRoadmaps,
    ...discover,
    handleSearch: f.handleSearch,
    handleDifficultyChange: f.handleDifficultyChange,
    handleSortChange: f.handleSortChange,
    handleTabChange,
    handleCategoryChange: f.handleCategoryChange,
    handleRemoveCategory: f.handleRemoveCategory,
    handleClearCategories: f.handleClearCategories,
    handleCreateSuccess,
  };
}

export type RoadmapDashboardState = ReturnType<typeof useRoadmapDashboard>;
