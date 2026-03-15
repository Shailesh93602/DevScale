import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-8">
        {/* Header Skeleton */}
        <Card className="overflow-hidden border-none bg-card shadow-xl ring-1 ring-border/50">
          <Skeleton className="h-48 w-full" />
          <CardContent className="relative -mt-16 pb-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
              <Skeleton className="h-32 w-32 rounded-full border-4 border-card" />
              <div className="space-y-2 pb-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-8 lg:col-span-1">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-none bg-card shadow-lg ring-1 ring-border/50"
              >
                <CardContent className="space-y-4 p-6">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Area */}
          <div className="space-y-8 lg:col-span-2">
            <Card className="border-none bg-card shadow-lg ring-1 ring-border/50">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
