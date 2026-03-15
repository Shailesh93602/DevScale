import { EnrolledRoadmap } from '@/hooks/useRoadmapApi';
import Image from 'next/image';

export interface EnrolledRoadmapCardProps {
  roadmap: EnrolledRoadmap;
}

export const EnrolledRoadmapCard: React.FC<EnrolledRoadmapCardProps> = ({
  roadmap,
}) => {
  return (
    <div className="rounded-lg border p-4 hover:bg-muted/50">
      <div className="flex items-start gap-4">
        {roadmap.thumbnail && (
          <Image
            src={roadmap.thumbnail}
            alt={roadmap.title}
            className="h-16 w-16 rounded-lg object-cover"
            width={500}
            height={500}
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{roadmap.title}</h3>
          <p className="text-sm text-muted-foreground">
            By {roadmap?.user?.full_name}
          </p>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${roadmap.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {roadmap.completedTopics} of {roadmap.totalTopics} topics
              completed ({roadmap.progress}%)
            </p>
          </div>
          {roadmap.nextTopic && (
            <div className="mt-4">
              <p className="text-sm font-medium">Next up:</p>
              <p className="text-sm text-muted-foreground">
                {roadmap.nextTopic.title} ({roadmap.nextTopic.estimatedTime})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
