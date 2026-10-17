import React from 'react';
import { format, isValid } from 'date-fns';
import { Clock } from 'lucide-react';
import { WeeklyActivity } from '@/hooks/useStreakApi';

interface ActivityTimelineProps {
  activities: WeeklyActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
}) => {
  const sortedActivities = (activities || [])
    .map((activity) => ({ activity, at: new Date(activity.date) }))
    .filter(({ at }) => isValid(at))
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="space-y-4">
      {sortedActivities.map(({ activity, at }) => (
        <div
          key={`${activity.date}-${activity.activityType}`}
          className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="rounded-full bg-primary/10 p-2">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {(activity.activityType ?? 'activity')
                .replace(/_/g, ' ')
                .toLowerCase()}{' '}
              — {activity.minutesSpent} min
            </p>
            <p className="text-sm text-muted-foreground">
              {at.toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(at, 'h:mm a')}
          </div>
        </div>
      ))}

      {sortedActivities.length === 0 && (
        <div className="text-center text-muted-foreground">
          No activities recorded yet
        </div>
      )}
    </div>
  );
};
