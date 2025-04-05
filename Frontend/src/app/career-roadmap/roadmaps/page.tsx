'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search, Settings } from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { useIntersection } from '@/hooks/useIntersection';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Import the shared RoadmapCard component
import RoadmapCard, {
  RoadmapType,
  RoadmapCardSkeleton,
} from '@/components/Roadmap/RoadmapCard';

// Use the shared type
type IRoadmap = RoadmapType;

interface APIRoadmap {
  id: string;
  title: string;
  description: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  difficulty: string | null;
  estimatedHours: number | null;
  popularity: number;
  version: string;
  tags: string;
  category_id: string | null;
  main_concepts: Array<{
    main_concept: {
      id: string;
      name: string;
      description: string;
      order: number;
      subjects: Array<{
        id: string;
        main_concept_id: string;
        subject_id: string;
        order: number;
      }>;
    };
  }>;
}

interface APIResponseMeta {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const transformRoadmap = (apiRoadmap: APIRoadmap): RoadmapType => {
  return {
    id: apiRoadmap.id,
    title: apiRoadmap.title,
    description: apiRoadmap.description,
    difficulty: apiRoadmap.difficulty as
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | undefined,
    author: {
      id: apiRoadmap.user_id,
      name: 'Anonymous', // You might want to fetch user details separately or include them in the API response
    },
    steps: apiRoadmap.main_concepts.length,
    estimatedTime: apiRoadmap.estimatedHours
      ? `${apiRoadmap.estimatedHours} hours`
      : undefined,
    createdAt: apiRoadmap.created_at,
    updatedAt: apiRoadmap.updated_at,
    isEnrolled: false, // These could be included in the API response
    isBookmarked: false,
    isLiked: false,
    enrollmentCount: 0,
    likesCount: 0,
    commentsCount: 0,
    bookmarksCount: 0,
    rating: 0,
  };
};

const ITEMS_PER_PAGE = 12;

interface RoadmapGridProps {
  roadmaps: IRoadmap[];
  viewMode: 'grid' | 'list';
}

const RoadmapGrid = ({ roadmaps, viewMode }: RoadmapGridProps) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {roadmaps?.map((roadmap) => (
          <div
            key={roadmap?.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <div className="aspect-video w-48 overflow-hidden rounded-md">
              {roadmap?.thumbnail && (
                <img
                  src={roadmap.thumbnail}
                  alt={roadmap.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{roadmap?.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {roadmap?.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {roadmap.author && (
                  <span className="text-sm text-muted-foreground">
                    By {roadmap?.author?.name}
                  </span>
                )}
                {roadmap.difficulty && (
                  <Badge variant="secondary">{roadmap.difficulty}</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {roadmaps.map((roadmap, index) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} />
      ))}
    </div>
  );
};

const RoadmapsPage = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all'; // can be 'featured', 'trending', or 'all'

  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const [getRoadmaps, { isLoading }] = useAxiosGet('/roadmaps');

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef);

  const fetchRoadmaps = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sort: sortBy,
      });

      if (type !== 'all') {
        params.append('type', type);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (difficultyFilter && difficultyFilter !== 'all') {
        params.append('difficulty', difficultyFilter);
      }

      const response = await getRoadmaps({ params });
      const responseData = response.data as {
        success: boolean;
        message: string;
        data: {
          data: APIRoadmap[];
          meta: APIResponseMeta;
        };
      };

      const { data: apiData, meta } = responseData.data;
      const transformedRoadmaps = apiData.map(transformRoadmap);

      if (page === 1) {
        setRoadmaps(transformedRoadmaps);
      } else {
        setRoadmaps((prev) => [...prev, ...transformedRoadmaps]);
      }

      setHasMore(meta.hasNextPage);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to fetch roadmaps');
    }
  }, [page, searchQuery, difficultyFilter, sortBy, type, getRoadmaps]);

  useEffect(() => {
    setPage(1);
    setRoadmaps([]);
    fetchRoadmaps();
  }, [type, fetchRoadmaps]);

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

  return (
    <div className="min-h-screen bg-background px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {type === 'featured'
              ? 'Featured Roadmaps'
              : type === 'trending'
                ? 'Trending Roadmaps'
                : 'Explore Roadmaps'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {type === 'featured'
              ? 'Hand-picked roadmaps to accelerate your career growth'
              : type === 'trending'
                ? 'Most popular roadmaps among the community'
                : 'Discover roadmaps created by industry experts'}
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <Filter size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode('grid')}>
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('list')}>
                List View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading && page === 1 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            }
          >
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <RoadmapCardSkeleton key={index} />
              ))}
          </div>
        ) : roadmaps.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <RoadmapGrid roadmaps={roadmaps} viewMode={viewMode} />
          </motion.div>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-xl font-medium">No roadmaps found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
          </div>
        )}

        {hasMore && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapsPage;
