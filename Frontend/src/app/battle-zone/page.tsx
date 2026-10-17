'use client';
import { Suspense, lazy } from 'react';
import { useJoinAndEnterBattle } from '@/hooks/useJoinAndEnterBattle';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load components
const BattleZoneLayout = lazy(
  () => import('@/components/Battle/BattleZoneLayout'),
);
const BattleList = lazy(() =>
  import('@/components/Battle/BattleList').then((mod) => ({
    default: mod.BattleList,
  })),
);

export default function BattleZonePage() {
  const handleJoinBattle = useJoinAndEnterBattle();

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      }
    >
      <BattleZoneLayout>
        <div className="container mx-auto space-y-4 p-4">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <BattleList onJoinBattle={handleJoinBattle} />
          </Suspense>
        </div>
      </BattleZoneLayout>
    </Suspense>
  );
}
