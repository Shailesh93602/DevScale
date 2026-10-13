'use client';

import { useRef, type ReactNode } from 'react';
import { Bookmark, BookOpen, FolderTree, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CreateRoadmap } from './create-roadmap';
import {
  RoadmapDashboardState,
  useRoadmapDashboard,
} from './components/useRoadmapDashboard';
import { RoadmapHero } from './components/RoadmapHero';
import { RoadmapSearchBar, RoadmapTabsBar } from './components/RoadmapFilters';
import {
  EmptyRoadmapState,
  RoadmapGrid,
  RoadmapGridSkeleton,
  RoadmapShowcase,
  RoadmapShowcaseSkeleton,
} from './components/RoadmapSections';

type S = RoadmapDashboardState;

function DiscoverTab({ s }: { s: S }) {
  const { featuredRoadmaps, trendingRoadmaps } = s;
  const nothingToShow =
    !s.isFeaturedLoading &&
    !s.isTrendingLoading &&
    featuredRoadmaps?.length === 0 &&
    trendingRoadmaps?.length === 0;
  return (
    <>
      {s.isFeaturedLoading ? (
        <RoadmapShowcaseSkeleton />
      ) : featuredRoadmaps?.length > 0 ? (
        <RoadmapShowcase
          title="Featured Roadmaps"
          type="featured"
          roadmaps={featuredRoadmaps}
        />
      ) : null}

      {s.isTrendingLoading ? (
        <RoadmapShowcaseSkeleton />
      ) : trendingRoadmaps?.length > 0 ? (
        <RoadmapShowcase
          title="Trending Now"
          type="trending"
          roadmaps={trendingRoadmaps}
        />
      ) : null}

      {nothingToShow && (
        <EmptyRoadmapState
          icon={Sparkles}
          title="No roadmaps available yet"
          description="Be the first to create a roadmap and share your knowledge with the community."
          action={<CreateButton s={s} />}
        />
      )}
    </>
  );
}

function CreateButton({ s }: { s: S }) {
  return (
    <Button onClick={() => s.setIsCreateModalOpen(true)}>
      <Plus size={16} className="mr-2" /> Create Roadmap
    </Button>
  );
}

function ExploreButton({ s }: { s: S }) {
  return (
    <Button variant="outline" onClick={() => s.handleTabChange('discover')}>
      Explore Roadmaps
    </Button>
  );
}

function PersonalTab({ s, empty }: { s: S; empty: ReactNode }) {
  if (s.isLoading) return <RoadmapGridSkeleton />;
  if (s.filteredRoadmaps?.length > 0) {
    return <RoadmapGrid roadmaps={s.filteredRoadmaps} />;
  }
  return <>{empty}</>;
}

const RoadmapPage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const s = useRoadmapDashboard(loadMoreRef);

  return (
    <div className="min-h-screen bg-background">
      <RoadmapHero
        onCreate={() => s.setIsCreateModalOpen(true)}
        onExplore={() => s.router.push('/career-roadmap/roadmaps')}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-8">
          <Tabs
            value={s.activeTab}
            className="w-full"
            onValueChange={s.handleTabChange}
          >
            <RoadmapTabsBar s={s} />
            <RoadmapSearchBar s={s} />

            <TabsContent value="discover" className="mt-6">
              <DiscoverTab s={s} />
            </TabsContent>

            <TabsContent value="enrolled" className="mt-6">
              <PersonalTab
                s={s}
                empty={
                  <EmptyRoadmapState
                    icon={BookOpen}
                    title="No enrolled roadmaps"
                    description="Explore and enroll in roadmaps to track your progress."
                    action={<ExploreButton s={s} />}
                  />
                }
              />
            </TabsContent>

            <TabsContent value="created" className="mt-6">
              <PersonalTab
                s={s}
                empty={
                  <EmptyRoadmapState
                    icon={FolderTree}
                    title="No created roadmaps"
                    description="Create your first roadmap to share your knowledge with others."
                    action={<CreateButton s={s} />}
                  />
                }
              />
            </TabsContent>

            <TabsContent value="bookmarked" className="mt-6">
              <PersonalTab
                s={s}
                empty={
                  <EmptyRoadmapState
                    icon={Bookmark}
                    title="No bookmarked roadmaps"
                    description="Bookmark roadmaps to save them for later."
                    action={<ExploreButton s={s} />}
                  />
                }
              />
            </TabsContent>
          </Tabs>
        </div>

        {s.hasMore && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => s.setPage((p) => p + 1)}>
              Load More
            </Button>
          </div>
        )}

        <CreateRoadmap
          isOpen={s.isCreateModalOpen}
          onClose={() => s.setIsCreateModalOpen(false)}
          onSuccess={s.handleCreateSuccess}
          categories={s.categories}
        />
      </div>
    </div>
  );
};

export default RoadmapPage;
