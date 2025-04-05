import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { WeeklyActivity } from '@/hooks/useStreakApi';

interface ActivityTimelineProps {
  activities: WeeklyActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
}) => {
  console.log('🚀 ----------------------------🚀');
  console.log('🚀 ~ activities: 124', activities);
  console.log('🚀 ----------------------------🚀');

  const sortedActivities = [...(activities || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="bg-primary/10 rounded-full p-2">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(activity.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(activity.timestamp), 'h:mm a')}
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center text-gray-500">
          No activities recorded yet
        </div>
      )}
    </div>
  );
};
