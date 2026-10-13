import type { ComponentType, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoadmapCard, {
  RoadmapType,
  RoadmapCardSkeleton,
} from '@/components/Roadmap/RoadmapCard';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';

const GRID_CLASS = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

export function RoadmapGrid({ roadmaps }: { roadmaps: RoadmapType[] }) {
  const { handleLike, handleBookmark } = useRoadmapSocial();

  return (
    <div className={GRID_CLASS}>
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
}

export function RoadmapGridSkeleton() {
  return (
    <div className={GRID_CLASS}>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <RoadmapCardSkeleton key={index} />
        ))}
    </div>
  );
}

/** A titled row of roadmaps (Featured / Trending) with a "View All" link once it is full. */
export function RoadmapShowcase({
  title,
  type,
  roadmaps,
}: {
  title: string;
  type: 'featured' | 'trending';
  roadmaps: RoadmapType[];
}) {
  const router = useRouter();
  const showViewAll = roadmaps?.length >= 6;

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => router.push(`/career-roadmap/roadmaps?type=${type}`)}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className={GRID_CLASS}>
        {roadmaps?.map((roadmap, index) => (
          <RoadmapCard key={roadmap?.id} roadmap={roadmap} index={index} />
        ))}
      </div>
    </div>
  );
}

export function RoadmapShowcaseSkeleton() {
  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
      </div>
      <RoadmapGridSkeleton />
    </div>
  );
}

export function EmptyRoadmapState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <Icon size={48} className="mb-4 text-muted-foreground" />
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="mb-4 text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
