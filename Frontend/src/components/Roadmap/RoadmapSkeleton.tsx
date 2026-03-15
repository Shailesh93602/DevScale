import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const RoadmapSkeleton = () => {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="space-y-4 p-6">
          {/* Section Title */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Section Content */}
          <div className="space-y-4 pl-16">
            {/* Subjects */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((subIndex) => (
                <Card key={subIndex} className="space-y-3 p-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
