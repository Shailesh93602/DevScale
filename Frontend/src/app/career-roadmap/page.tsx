'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  ChevronRight,
  Award,
  CheckCircle2,
  Filter,
  BookOpen,
  Sparkles,
  Bookmark,
  Settings,
  FolderTree,
} from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { useIntersection } from '@/hooks/useIntersection';
import { CreateRoadmap } from './create-roadmap';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';
import {
  useRoadmaps,
  RoadmapFilters,
  ApiResponse,
  RoadmapsResponse,
} from '@/hooks/useRoadmapApi';
import { logger } from '@/lib/logger';

// Import the shared RoadmapCard component
import RoadmapCard, {
  RoadmapType,
  RoadmapCardSkeleton,
} from '@/components/Roadmap/RoadmapCard';

// Use the shared type
type IRoadmap = RoadmapType;

interface RoadmapCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

const ITEMS_PER_PAGE = 9;

interface RoadmapGridProps {
  roadmaps: IRoadmap[];
}

const RoadmapGrid = ({ roadmaps }: RoadmapGridProps) => {
  const { handleLike, handleBookmark } = useRoadmapSocial();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {roadmaps.map((roadmap, index) => (
        <RoadmapCard
          key={roadmap.id}
          roadmap={roadmap}
          index={index}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />
      ))}
    </div>
  );
};

const FeaturedRoadmaps = ({ roadmaps }: { roadmaps: IRoadmap[] }) => {
  const router = useRouter();
  const showViewAll = roadmaps?.length >= 6;

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Roadmaps</h2>
        {showViewAll && (
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() =>
              router.push('/career-roadmap/roadmaps?type=featured')
            }
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps?.map((roadmap, index) => (
          <RoadmapCard key={roadmap?.id} roadmap={roadmap} index={index} />
        ))}
      </div>
    </div>
  );
};

const TrendingRoadmaps = ({ roadmaps }: { roadmaps: IRoadmap[] }) => {
  const router = useRouter();
  const showViewAll = roadmaps?.length >= 6;

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        {showViewAll && (
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() =>
              router.push('/career-roadmap/roadmaps?type=trending')
            }
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps?.map((roadmap, index) => (
          <RoadmapCard key={roadmap?.id} roadmap={roadmap} index={index} />
        ))}
      </div>
    </div>
  );
};

// Remove unused skeleton components
const FeaturedRoadmapsSkeleton = () => (
  <div className="mb-12">
    <div className="mb-6 flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
      <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
    </div>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <RoadmapCardSkeleton key={index} />
        ))}
    </div>
  </div>
);

const TrendingRoadmapsSkeleton = () => (
  <div className="mb-12">
    <div className="mb-6 flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
      <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
    </div>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <RoadmapCardSkeleton key={index} />
        ))}
    </div>
  </div>
);

const RoadmapPage = () => {
  const currentUser = useSelector(
    (state: { user: { user: { id?: string } } }) => state?.user?.user,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [featuredRoadmaps, setFeaturedRoadmaps] = useState<IRoadmap[]>([]);
  const [trendingRoadmaps, setTrendingRoadmaps] = useState<IRoadmap[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isLoadingMoreRef = useRef(false);

  // Filter object for non-pagination params (used to detect filter changes)
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

  // Full filters including page — used when actually fetching
  const filtersWithPage: RoadmapFilters = useMemo(() => {
    return { ...filters, page };
  }, [filters, page]);

  // Use the updated useRoadmaps hook
  const {
    data: roadmapsData,
    meta: roadmapsMeta,
    isLoading,
    refetch: fetchRoadmapsData,
  } = useRoadmaps(activeTab !== 'discover' ? filtersWithPage : undefined);

  const [getCategories] = useAxiosGet<RoadmapCategory[]>(
    '/roadmaps/categories',
  );

  // Create separate API hooks for featured and trending roadmaps
  const [getFeaturedRoadmaps] = useAxiosGet<IRoadmap[]>('/roadmaps');
  const [getTrendingRoadmaps] = useAxiosGet<IRoadmap[]>('/roadmaps');

  // Stable refs for the execute functions — prevents re-triggering the effect
  // on every render when the hook returns a new function reference
  const getFeaturedRoadmapsRef = useRef(getFeaturedRoadmaps);
  const getTrendingRoadmapsRef = useRef(getTrendingRoadmaps);
  useEffect(() => {
    getFeaturedRoadmapsRef.current = getFeaturedRoadmaps;
  });
  useEffect(() => {
    getTrendingRoadmapsRef.current = getTrendingRoadmaps;
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
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

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch featured and trending roadmaps only when in discover tab
  // Dependency is ONLY activeTab — execute functions are read via stable refs
  useEffect(() => {
    if (activeTab !== 'discover') return;

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

    // Cleanup: mark as cancelled if the tab changes before completion
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle infinite scroll — use ref for guard to avoid re-triggering when state resets
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
      const actualRoadmaps: any[] = roadmapsData || [];
      if (page === 1) {
        setRoadmaps(actualRoadmaps);
      } else {
        setRoadmaps((prev) => [...prev, ...actualRoadmaps]);
      }

      const meta = roadmapsMeta as any;
      if (meta && typeof meta.hasNextPage === 'boolean') {
        setHasMore(meta.hasNextPage);
      } else {
        setHasMore(actualRoadmaps.length === ITEMS_PER_PAGE);
      }
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [roadmapsData, roadmapsMeta, page]);

  // Fetch roadmaps when filters change (not page — pagination is handled by infinite scroll)
  useEffect(() => {
    if (activeTab !== 'discover') {
      fetchRoadmapsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  // Fetch next page when page changes (separate from filter changes)
  useEffect(() => {
    if (page > 1 && activeTab !== 'discover') {
      fetchRoadmapsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setPage(1);
      setRoadmaps([]);
    }, 500),
    [],
  );

  // Filter handlers
  const handleDifficultyChange = useCallback((value: string) => {
    setDifficultyFilter(value);
    setPage(1);
    setRoadmaps([]);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
    setRoadmaps([]);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setRoadmaps([]);
    setHasMore(false);
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      // Reset page and roadmaps when categories change
      setPage(1);
      setRoadmaps([]);

      return newCategories;
    });
  }, []);

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([]);
    setPage(1);
    setRoadmaps([]);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setPage(1);
    setRoadmaps([]);
    fetchRoadmapsData();
    toast.success('Roadmap created successfully!');
  }, [fetchRoadmapsData]);

  const filteredRoadmaps = useMemo(() => {
    if (activeTab === 'enrolled') {
      return roadmaps?.filter((roadmap) => roadmap?.isEnrolled);
    }
    if (activeTab === 'created') {
      return roadmaps?.filter(
        (roadmap) => roadmap?.author?.id === currentUser?.id,
      );
    }
    if (activeTab === 'bookmarked') {
      return roadmaps?.filter((roadmap) => roadmap?.isBookmarked);
    }
    return roadmaps;
  }, [roadmaps, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <div className="from-primary/10 relative overflow-hidden bg-gradient-to-b to-background px-6 py-20 sm:py-28 lg:px-8">
        <div className="shadow-primary/10 ring-primary/10 absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background/10 shadow-xl ring-1" />

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/10 absolute -right-40 -top-40 h-80 w-80 rounded-full blur-3xl" />
          <div className="bg-primary/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div>
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 font-medium text-foreground"
            >
              <Award className="mr-2 h-4 w-4" /> Engineering Career Growth
            </Badge>
            <h1 className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              Master Your <span className="text-primary">Engineering Path</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Expert-curated roadmaps to guide your engineering journey. Start,
              track, and achieve your career goals with step-by-step guidance
              from industry professionals.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                className="group flex items-center gap-2 px-6 py-6 text-base"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} /> Create Roadmap
              </Button>
              <Button
                className="group flex items-center gap-2 px-6 py-6 text-base"
                onClick={() => router.push('/career-roadmap/roadmaps')}
              >
                Explore Popular Paths
                <ChevronRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Redesigned Layout */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Tabs and Filters Section */}
        <div className="mt-8">
          <Tabs
            value={activeTab}
            className="w-full"
            onValueChange={handleTabChange}
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="discover" className="gap-2">
                  <Sparkles size={16} />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="enrolled" className="gap-2">
                  <BookOpen size={16} />
                  Enrolled
                </TabsTrigger>
                <TabsTrigger value="created" className="gap-2">
                  <FolderTree size={16} />
                  Created
                </TabsTrigger>
                <TabsTrigger value="bookmarked" className="gap-2">
                  <Bookmark size={16} />
                  Bookmarked
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger
                    className="w-[140px]"
                    aria-label="Sort Roadmaps"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="enrolled">Most Enrolled</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="View Settings"
                    >
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Grid View</DropdownMenuItem>
                    <DropdownMenuItem>List View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search roadmaps..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={difficultyFilter}
                    onValueChange={handleDifficultyChange}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[180px]"
                      aria-label="Filter by Difficulty"
                    >
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter size={16} />
                        Categories
                        {selectedCategories.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                          >
                            {selectedCategories.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-medium">Categories</h4>
                          {selectedCategories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearCategories}
                              className="h-6 px-2 text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-1">
                            {isCategoriesLoading
                              ? Array(8)
                                  .fill(0)
                                  .map((_, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-lg p-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 animate-pulse rounded-full bg-muted"></div>
                                        <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                                      </div>
                                      <div className="h-4 w-4 animate-pulse rounded bg-muted"></div>
                                    </div>
                                  ))
                              : categories.map((category) => (
                                  <div
                                    key={category.id}
                                    className={`group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-accent ${
                                      selectedCategories.includes(category.id)
                                        ? 'bg-primary/10 text-primary'
                                        : ''
                                    }`}
                                    onClick={() =>
                                      handleCategoryChange(category.id)
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      {category.icon && (
                                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                                          <i className={category.icon} />
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium">
                                          {category.name}
                                        </p>
                                        {category.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {category.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <CheckCircle2
                                      className={`h-4 w-4 ${
                                        selectedCategories.includes(category.id)
                                          ? 'text-primary'
                                          : 'invisible group-hover:visible'
                                      }`}
                                    />
                                  </div>
                                ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Selected Categories Pills */}
              {selectedCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId,
                    );
                    return (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="gap-1 px-2 py-1"
                      >
                        {category?.name || 'Category'}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPage(1);
                            setRoadmaps([]);
                            setSelectedCategories((prev) =>
                              prev.filter((id) => id !== categoryId),
                            );
                          }}
                          className="ml-1 h-3.5 w-3.5 rounded-full p-0 hover:bg-muted"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Content Tabs */}
            <TabsContent value="discover" className="mt-6">
              {isFeaturedLoading ? (
                <FeaturedRoadmapsSkeleton />
              ) : featuredRoadmaps?.length > 0 ? (
                <FeaturedRoadmaps roadmaps={featuredRoadmaps} />
              ) : null}

              {isTrendingLoading ? (
                <TrendingRoadmapsSkeleton />
              ) : trendingRoadmaps?.length > 0 ? (
                <TrendingRoadmaps roadmaps={trendingRoadmaps} />
              ) : null}

              {!isFeaturedLoading &&
                !isTrendingLoading &&
                featuredRoadmaps?.length === 0 &&
                trendingRoadmaps?.length === 0 && (
                  <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <Sparkles
                      size={48}
                      className="mb-4 text-muted-foreground"
                    />
                    <h3 className="mb-2 text-xl font-medium">
                      No roadmaps available yet
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Be the first to create a roadmap and share your knowledge
                      with the community.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus size={16} className="mr-2" /> Create Roadmap
                    </Button>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="enrolled" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <RoadmapCardSkeleton key={index} />
                    ))}
                </div>
              ) : filteredRoadmaps?.length > 0 ? (
                <RoadmapGrid roadmaps={filteredRoadmaps} />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <BookOpen size={48} className="mb-4 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-medium">
                    No enrolled roadmaps
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Explore and enroll in roadmaps to track your progress.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange('discover')}
                  >
                    Explore Roadmaps
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <RoadmapCardSkeleton key={index} />
                    ))}
                </div>
              ) : filteredRoadmaps?.length > 0 ? (
                <RoadmapGrid roadmaps={filteredRoadmaps} />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FolderTree
                    size={48}
                    className="mb-4 text-muted-foreground"
                  />
                  <h3 className="mb-2 text-xl font-medium">
                    No created roadmaps
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Create your first roadmap to share your knowledge with
                    others.
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={16} className="mr-2" /> Create Roadmap
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarked" className="mt-6">
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <RoadmapCardSkeleton key={index} />
                    ))}
                </div>
              ) : filteredRoadmaps?.length > 0 ? (
                <RoadmapGrid roadmaps={filteredRoadmaps} />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Bookmark size={48} className="mb-4 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-medium">
                    No bookmarked roadmaps
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Bookmark roadmaps to save them for later.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange('discover')}
                  >
                    Explore Roadmaps
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load More
            </Button>
          </div>
        )}

        <CreateRoadmap
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default RoadmapPage;
