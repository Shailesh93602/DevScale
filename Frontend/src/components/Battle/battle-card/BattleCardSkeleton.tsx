import { Card } from '@/components/ui/card';

export const BattleCardSkeleton = ({
  variant = 'default',
}: {
  variant?: 'default' | 'compact';
}) => {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <Card className="w-full overflow-hidden border-l-4 border-l-muted">
        <div className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border-t-2 border-t-muted">
      <div className="animate-pulse">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-12 rounded-full bg-muted" />
            </div>
            <div className="h-5 w-14 rounded-full bg-muted" />
          </div>

          <div className="space-y-2">
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded-full bg-muted" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-0">
          <div className="h-9 flex-1 rounded bg-muted" />
          <div className="h-9 w-20 rounded bg-muted" />
        </div>
      </div>
    </Card>
  );
};
