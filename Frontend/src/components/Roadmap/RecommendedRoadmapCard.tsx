import { RecommendedRoadmap } from '@/hooks/useRoadmapApi';
import Image from 'next/image';

export interface RecommendedRoadmapCardProps {
  roadmap: RecommendedRoadmap;
}

export const RecommendedRoadmapCard: React.FC<RecommendedRoadmapCardProps> = ({
  roadmap,
}) => {
  return (
    <div className="rounded-lg border p-4 hover:bg-muted/50">
      <div className="flex items-start gap-4">
        {roadmap?.thumbnail && (
          <Image
            src={roadmap?.thumbnail}
            alt={roadmap?.title}
            className="h-16 w-16 rounded-lg object-cover"
            width={500}
            height={500}
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{roadmap?.title}</h3>
          <p className="text-sm text-muted-foreground">
            By {roadmap?.author?.name}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {roadmap?.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{roadmap?.topics} topics</span>
            <span>{roadmap?.enrollmentCount} enrolled</span>
            <span>{roadmap?.rating?.toFixed(1)} rating</span>
          </div>
          <div className="mt-4">
            <span className="bg-primary/10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-primary">
              {roadmap?.matchScore}% match - {roadmap?.matchReason}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
