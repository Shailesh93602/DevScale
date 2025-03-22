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
import { Plus, Search } from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { useIntersection } from '@/hooks/useIntersection';
import { CreateRoadmap } from './create-roadmap';

interface IRoadmap {
  id: string;
  title: string;
  description: string;
  author: string;
  isEnrolled?: boolean;
}

interface RoadmapCategory {
  id: string;
  name: string;
}

interface PaginatedResponse {
  data: IRoadmap[];
  meta: {
    hasNextPage: boolean;
  };
}

const ITEMS_PER_PAGE = 10;

interface RoadmapCardProps {
  roadmap: IRoadmap;
}

const RoadmapCard = ({ roadmap }: RoadmapCardProps) => {
  return (
    <div
      key={roadmap.id}
      className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">
            {roadmap.title}
          </h3>
          <p className="text-sm text-muted-foreground">{roadmap.description}</p>
        </div>
      </div>
    </div>
  );
};

interface RoadmapGridProps {
  roadmaps: IRoadmap[];
}

const RoadmapGrid = ({ roadmaps }: RoadmapGridProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {roadmaps.map((roadmap) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} />
      ))}
    </div>
  );
};

const Roadmap = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [roadmaps, setRoadmaps] = useState<IRoadmap[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const [getRoadmaps, { isLoading }] =
    useAxiosGet<PaginatedResponse>('/roadmaps');
  const [getCategories] = useAxiosGet<RoadmapCategory[]>(
    '/roadMaps/categories',
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(loadMoreRef);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  }, [getCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isIntersecting && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting, hasMore, activeTab]);

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(1);
    setRoadmaps([]); // Clear existing roadmaps when search changes
  }, 500);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
    setRoadmaps([]); // Clear existing roadmaps when category changes
  };

  const handleCreateSuccess = () => {
    setPage(1);
    setRoadmaps([]); // Clear existing roadmaps when new roadmap is created
    fetchRoadmaps();
  };

  const fetchRoadmaps = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
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
  }, [page, searchQuery, selectedCategory, getRoadmaps]);

  useEffect(() => {
    if (activeTab === 'all') {
      fetchRoadmaps();
    }
  }, [fetchRoadmaps, activeTab]);

  const filteredRoadmaps = useMemo(() => {
    if (activeTab === 'enrolled') {
      return roadmaps.filter((roadmap) => roadmap.isEnrolled);
    }
    if (activeTab === 'created') {
      return roadmaps.filter((roadmap) => roadmap.author === 'me');
    }
    return roadmaps;
  }, [roadmaps, activeTab]);

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
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={16} /> Create Roadmap
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <Tabs
            defaultValue="all"
            className="space-y-8"
            onValueChange={(value) => {
              setActiveTab(value);
              setPage(1);
              if (value === 'all') {
                setRoadmaps([]);
                fetchRoadmaps();
              }
            }}
          >
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
              <TabsTrigger value="all" className="rounded-sm px-6">
                All Roadmaps
              </TabsTrigger>
              <TabsTrigger value="enrolled" className="rounded-sm px-6">
                Enrolled
              </TabsTrigger>
              <TabsTrigger value="created" className="rounded-sm px-6">
                Created by Me
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <RoadmapGrid roadmaps={filteredRoadmaps} />
              {isLoading && (
                <div className="mt-8 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
                </div>
              )}
              {hasMore && activeTab === 'all' && (
                <div ref={loadMoreRef} className="h-4" />
              )}
            </TabsContent>

            <TabsContent value="enrolled" className="mt-6">
              <RoadmapGrid roadmaps={filteredRoadmaps} />
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              <RoadmapGrid roadmaps={filteredRoadmaps} />
            </TabsContent>
          </Tabs>
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

export default Roadmap;
