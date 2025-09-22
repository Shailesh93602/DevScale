import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  thisWeek: {
    date: string;
    minutesSpent: number;
  }[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  longestStreak,
  thisWeek,
}) => {
  const hasActivity = thisWeek.some((day) => day.minutesSpent > 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Learning Streak</CardTitle>
        <Flame className="h-5 w-5 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold text-foreground">
              {currentStreak} days
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-2xl font-bold text-foreground">
              {longestStreak} days
            </p>
          </div>
        </div>

        {hasActivity ? (
          <>
            <div className="grid grid-cols-7 gap-2">
              {thisWeek.map((day, index) => {
                const minutesSpent = day.minutesSpent;
                const intensity =
                  minutesSpent > 0 ? Math.min(minutesSpent / 60, 1) : 0;

                return (
                  <div key={day.date} className="text-center">
                    <div className="mb-1 text-xs text-muted-foreground">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                    </div>
                    <div
                      className={cn(
                        'mx-auto h-8 w-8 rounded-md transition-colors',
                        minutesSpent > 0
                          ? `bg-orange-${Math.ceil(intensity * 500)}`
                          : 'bg-muted',
                      )}
                      title={`${minutesSpent} minutes spent learning`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div>Less</div>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-muted" />
                <div className="h-3 w-3 rounded-sm bg-orange-100" />
                <div className="h-3 w-3 rounded-sm bg-orange-300" />
                <div className="h-3 w-3 rounded-sm bg-orange-500" />
              </div>
              <div>More</div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center space-y-3 rounded-lg border-2 border-dashed border-muted p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <Flame className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                No Activity Yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Start learning to build your streak!
              </p>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/career-roadmap">Start Learning</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;
