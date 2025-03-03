'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FocusCards } from '@/components/FocusCards';
import { toast } from 'react-toastify';
import { useAxiosGet } from '@/hooks/useAxios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { debounce } from '@/lib/utils';
import { useIntersection } from '@/hooks/useIntersection';

interface IRoadmap {
  id: string;
  title: string;
  description?: string;
  enrolledCount?: number;
  author?: string;
  isEnrolled?: boolean;
  comments?: number;
}

interface PaginatedResponse {
  roadmaps: IRoadmap[];
  hasMore: boolean;
  total: number;
}

const ITEMS_PER_PAGE = 9;

const TabContent = ({
  roadmaps,
  isLoading,
  hasMore,
  searchQuery,
  loadMoreRef,
}: {
  roadmaps: IRoadmap[];
  isLoading: boolean;
  hasMore: boolean;
  searchQuery: string;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FocusCards roadmaps={roadmaps} />
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {isLoading && (
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        )}
      </div>

      {!isLoading && !hasMore && roadmaps.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No more roadmaps to load
        </p>
      )}

      {!isLoading && roadmaps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-16">
          <div className="text-lg text-muted-foreground">No roadmaps found</div>
          <p className="text-sm text-muted-foreground/80">
            {searchQuery
              ? 'Try different search terms'
              : 'Be the first to create a roadmap'}
          </p>
        </div>
      )}
    </>
  );
};

const Roadmap = () => {
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [getRoadmaps] = useAxiosGet<PaginatedResponse>('/roadmaps');

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef);

  const fetchRoadmaps = useCallback(
    async (pageNumber: number, isNewSearch = false) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: pageNumber.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          search: searchQuery,
          type: activeTab,
        });

        const response = await getRoadmaps({ params });
        const newRoadmaps = response?.data?.roadmaps ?? [];

        setRoadmaps((prev) =>
          isNewSearch ? newRoadmaps : [...prev, ...newRoadmaps],
        );
        setHasMore(response?.data?.hasMore ?? false);
      } catch (error: unknown) {
        toast.error('Error fetching roadmaps');
        console.error((error as { message: string }).message);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, activeTab, getRoadmaps],
  );

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1);
      setSearchQuery(query);
      fetchRoadmaps(1, true);
    }, 500),
    [fetchRoadmaps],
  );

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setRoadmaps([]);
    fetchRoadmaps(1, true);
  };

  // Load more when scrolling to bottom
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
      fetchRoadmaps(page + 1);
    }
  }, [isIntersecting, hasMore, isLoading, page, fetchRoadmaps]);

  // Initial load
  useEffect(() => {
    fetchRoadmaps(1, true);
  }, [fetchRoadmaps]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-background/80" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background/10 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50/20" />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Choose Your Path
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Expert-curated roadmaps to guide your learning journey in tech.
            Start, track, and achieve your career goals.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-4 shadow-sm backdrop-blur-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search roadmaps..."
              className="bg-gray-50/50 pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="fullstack">Full Stack</SelectItem>
              </SelectContent>
            </Select>
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus size={16} /> Create Roadmap
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <Tabs
            defaultValue="featured"
            className="space-y-8"
            onValueChange={handleTabChange}
          >
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
              <TabsTrigger value="featured" className="rounded-sm px-6">
                Featured
              </TabsTrigger>
              <TabsTrigger value="my-roadmaps" className="rounded-sm px-6">
                My Roadmaps
              </TabsTrigger>
              <TabsTrigger value="enrolled" className="rounded-sm px-6">
                Enrolled
              </TabsTrigger>
            </TabsList>

            {['featured', 'my-roadmaps', 'enrolled'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <TabContent
                  roadmaps={roadmaps}
                  isLoading={isLoading}
                  hasMore={hasMore}
                  searchQuery={searchQuery}
                  loadMoreRef={loadMoreRef}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
