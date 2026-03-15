import { Skeleton } from '@/components/ui/skeleton';

export function ChallengeSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-muted/30 p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-7 w-[150px]" />
        <Skeleton className="h-5 w-[60px] rounded-full" />
      </div>
      <div className="mb-6 flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

export function ChallengeListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <ChallengeSkeleton key={i} />
      ))}
    </div>
  );
}
