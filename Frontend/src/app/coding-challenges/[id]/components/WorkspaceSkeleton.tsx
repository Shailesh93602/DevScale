import { Skeleton } from '@/components/ui/skeleton';

export function WorkspaceSkeleton() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-[80px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-grow gap-4">
        <div className="flex w-1/3 flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="w-full flex-grow" />
        </div>
        <div className="flex flex-grow flex-col gap-4">
          <Skeleton className="h-2/3 w-full" />
          <Skeleton className="h-1/3 w-full" />
        </div>
      </div>
    </div>
  );
}
