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
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';

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

interface PaginatedResponse {
  data: IRoadmap[];
  meta: {
    hasNextPage: boolean;
    total: number;
    page: number;
    lastPage: number;
  };
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

const CategoryList = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}: {
  categories: RoadmapCategory[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)] px-1">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Categories</h3>
          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategories([])}
              className="h-8 px-2 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-accent ${
                selectedCategories.includes(category.id)
                  ? 'bg-primary/10 text-primary'
                  : ''
              }`}
              onClick={() =>
                setSelectedCategories((prev) =>
                  prev.includes(category.id)
                    ? prev.filter((id) => id !== category.id)
                    : [...prev, category.id],
                )
              }
            >
              <div className="flex items-center gap-2">
                {category.icon && (
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <i className={category.icon} />
                  </div>
                )}
                <div>
                  <p className="font-medium">{category.name}</p>
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
      </div>
    </ScrollArea>
  );
};

// Add skeleton components for the page
const FeaturedRoadmapsSkeleton = () => (
  <div className="mb-12">
    <div className="mb-6 flex items-center justify-between">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
      <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
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
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
      <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
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

const CategoryListSkeleton = () => (
  <ScrollArea className="h-[calc(100vh-12rem)] px-1">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="space-y-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg p-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
      </div>
    </div>
  </ScrollArea>
);

const SearchAndFilterSkeleton = () => (
  <div className="my-4 flex items-center gap-4">
    <div className="relative flex-1">
      <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
        <Search size={16} />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 pl-10"></div>
    </div>
    <div className="h-10 w-[180px] animate-pulse rounded-md bg-gray-200"></div>
  </div>
);

const RoadmapPage = () => {
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
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  const [getRoadmaps, { isLoading }] =
    useAxiosGet<PaginatedResponse>('/roadmaps');
  const [getCategories] = useAxiosGet<RoadmapCategory[]>(
    '/roadMaps/categories',
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef);

  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const response = await getCategories();
      setCategories(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [getCategories]);

  const fetchFeaturedRoadmaps = useCallback(async () => {
    setIsFeaturedLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '6',
        type: 'featured',
      });
      const response = await getRoadmaps({ params });
      const { data } = response.data;
      setFeaturedRoadmaps(data);
    } catch (error) {
      console.error('Error fetching featured roadmaps:', error);
    } finally {
      setIsFeaturedLoading(false);
    }
  }, [getRoadmaps]);

  const fetchTrendingRoadmaps = useCallback(async () => {
    setIsTrendingLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '6',
        type: 'trending',
      });
      const response = await getRoadmaps({ params });
      const { data } = response.data;
      setTrendingRoadmaps(data);
    } catch (error) {
      console.error('Error fetching trending roadmaps:', error);
    } finally {
      setIsTrendingLoading(false);
    }
  }, [getRoadmaps]);

  useEffect(() => {
    fetchCategories();
    if (activeTab === 'discover') {
      fetchFeaturedRoadmaps();
      fetchTrendingRoadmaps();
    }
  }, [
    fetchCategories,
    fetchFeaturedRoadmaps,
    fetchTrendingRoadmaps,
    activeTab,
  ]);

  useEffect(() => {
    if (isIntersecting && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore]);

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(1);
    setRoadmaps([]);
  }, 500);

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
    setPage(1);
    setRoadmaps([]);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
    setRoadmaps([]);
  };

  const handleCreateSuccess = () => {
    setPage(1);
    setRoadmaps([]);
    fetchRoadmaps();
    toast.success('Roadmap created successfully!');
  };

  const fetchRoadmaps = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sort: sortBy,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (selectedCategories.length > 0) {
        selectedCategories.forEach((categoryId) => {
          params.append('categories', categoryId);
        });
      }

      if (difficultyFilter && difficultyFilter !== 'all') {
        params.append('difficulty', difficultyFilter);
      }

      const response = await getRoadmaps({ params });
      const { data, meta } = response.data;

      if (page === 1) {
        setRoadmaps(data);
      } else {
        setRoadmaps((prev) => [...prev, ...data]);
      }

      setHasMore(meta.hasNextPage);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to fetch roadmaps');
    }
  }, [
    page,
    searchQuery,
    selectedCategories,
    difficultyFilter,
    sortBy,
    getRoadmaps,
  ]);

  useEffect(() => {
    if (activeTab !== 'discover') {
      fetchRoadmaps();
    }
  }, [fetchRoadmaps, activeTab]);

  const filteredRoadmaps = useMemo(() => {
    if (activeTab === 'enrolled') {
      return roadmaps?.filter((roadmap) => roadmap?.isEnrolled);
    }
    if (activeTab === 'created') {
      return roadmaps?.filter(
        (roadmap) => roadmap?.author?.id === 'current_user_id',
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-primary">
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
                className="hover:bg-primary/90 group flex items-center gap-2 bg-primary px-6 py-6 text-base"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} /> Create Roadmap
              </Button>
              <Button
                variant="outline"
                className="group flex items-center gap-2 px-6 py-6 text-base"
                onClick={() => router.push('/career-roadmap/roadmaps')}
              >
                Explore Popular Paths
                <ChevronRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content with Enhanced Layout */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Enhanced Sidebar */}
          {isFilterExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full shrink-0 lg:w-72"
            >
              <div className="sticky top-24 rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="lg:hidden"
                  >
                    <Filter size={16} />
                  </Button>
                </div>

                {isCategoriesLoading ? (
                  <CategoryListSkeleton />
                ) : (
                  <CategoryList
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Enhanced Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={setActiveTab}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className="lg:hidden"
                    >
                      <Filter size={16} />
                    </Button>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[140px]">
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
                        <Button variant="ghost" size="icon">
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

                {isLoading ? (
                  <SearchAndFilterSkeleton />
                ) : (
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search roadmaps..."
                        className="pl-10"
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    <Select
                      value={difficultyFilter}
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Difficulties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <TabsContent value="discover" className="mt-6">
                  {isFeaturedLoading ? (
                    <FeaturedRoadmapsSkeleton />
                  ) : (
                    <FeaturedRoadmaps roadmaps={featuredRoadmaps} />
                  )}

                  {isTrendingLoading ? (
                    <TrendingRoadmapsSkeleton />
                  ) : (
                    <TrendingRoadmaps roadmaps={trendingRoadmaps} />
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
                      <BookOpen
                        size={48}
                        className="mb-4 text-muted-foreground"
                      />
                      <h3 className="mb-2 text-xl font-medium">
                        No enrolled roadmaps
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Explore and enroll in roadmaps to track your progress.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('discover')}
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
                      <Bookmark
                        size={48}
                        className="mb-4 text-muted-foreground"
                      />
                      <h3 className="mb-2 text-xl font-medium">
                        No bookmarked roadmaps
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Bookmark roadmaps to save them for later.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('discover')}
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
          </div>
        </div>

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
