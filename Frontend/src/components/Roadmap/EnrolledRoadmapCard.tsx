import { EnrolledRoadmap } from '@/hooks/useRoadmapApi';

export interface EnrolledRoadmapCardProps {
  roadmap: EnrolledRoadmap;
}

export const EnrolledRoadmapCard: React.FC<EnrolledRoadmapCardProps> = ({
  roadmap,
}) => {
  return (
    <div className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex items-start gap-4">
        {roadmap.thumbnail && (
          <img
            src={roadmap.thumbnail}
            alt={roadmap.title}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{roadmap.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By {roadmap.author.name}
          </p>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${roadmap.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {roadmap.completedTopics} of {roadmap.totalTopics} topics
              completed ({roadmap.progress}%)
            </p>
          </div>
          {roadmap.nextTopic && (
            <div className="mt-4">
              <p className="text-sm font-medium">Next up:</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {roadmap.nextTopic.title} ({roadmap.nextTopic.estimatedTime})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
