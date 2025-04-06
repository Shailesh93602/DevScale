import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CommentSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="p-4">
          <div className="flex gap-4">
            {/* Avatar */}
            <Skeleton className="h-10 w-10 rounded-full" />

            <div className="flex-1 space-y-4">
              {/* User info */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Comment content */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>

              {/* Nested replies (only for first comment) */}
              {index === 1 && (
                <div className="border-l-primary/10 mt-4 space-y-4 border-l-4 pl-6">
                  {[1, 2].map((replyIndex) => (
                    <Card key={replyIndex} className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
