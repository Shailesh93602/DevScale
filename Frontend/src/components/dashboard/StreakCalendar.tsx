import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomLink } from '@/components/ui/custom-link';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  thisWeek: {
    date: string;
    minutesSpent: number;
  }[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  longestStreak,
  thisWeek,
}) => {
  const hasActivity = thisWeek.some((day) => day.minutesSpent > 0);

  return (
    <div
      className="h-full overflow-hidden rounded-2xl border border-border bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Learning Streak</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10">
          <Flame className="h-4 w-4 text-orange" />
        </div>
      </div>

      <div className="p-5">
        {/* Streak Stats */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current
            </p>
            <p className="text-xl font-bold text-foreground">
              {currentStreak}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                days
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Longest
            </p>
            <p className="text-xl font-bold text-foreground">
              {longestStreak}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                days
              </span>
            </p>
          </div>
        </div>

        {/* Weekly Activity Grid */}
        {hasActivity ? (
          <>
            <div className="grid grid-cols-7 gap-1.5">
              {thisWeek.map((day, index) => {
                const intensity =
                  day.minutesSpent > 0 ? Math.min(day.minutesSpent / 60, 1) : 0;
                const opacityLevel =
                  intensity === 0
                    ? 0
                    : intensity < 0.25
                      ? 0.25
                      : intensity < 0.5
                        ? 0.5
                        : intensity < 0.75
                          ? 0.75
                          : 1;

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-1"
                  >
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {DAY_LABELS[index]}
                    </p>
                    <div
                      className={cn(
                        'h-7 w-7 rounded-lg transition-all duration-200',
                        day.minutesSpent > 0 ? 'bg-orange' : 'bg-muted',
                      )}
                      style={{
                        opacity:
                          day.minutesSpent > 0 ? 0.3 + opacityLevel * 0.7 : 1,
                      }}
                      title={`${day.minutesSpent} minutes on ${day.date}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Less</p>
              <div className="flex items-center gap-1">
                {[0.15, 0.35, 0.6, 0.85, 1].map((op) => (
                  <div
                    key={op}
                    className="h-2.5 w-2.5 rounded-sm bg-orange"
                    style={{ opacity: op }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">More</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10">
              <Flame className="h-5 w-5 text-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No Activity Yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Start learning to build your streak!
              </p>
            </div>
            <CustomLink
              variant="default"
              size="sm"
              href="/career-roadmap"
              className="mt-1 h-8 rounded-lg px-4 text-xs font-semibold"
            >
              Start Learning
            </CustomLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakCalendar;
