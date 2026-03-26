'use client';
import { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import useBattleApi from '@/hooks/useBattleApi';
import { useToast } from '@/hooks/use-toast';
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
  const router = useRouter();
  const { toast } = useToast();
  const { joinExistingBattle } = useBattleApi();

  const handleJoinBattle = async (battleId: string) => {
    try {
      await joinExistingBattle(battleId);
      router.push(`/battle-zone/${battleId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      // If user is already a participant, just navigate to the battle
      if (msg.includes('already') || msg.includes('joined')) {
        router.push(`/battle-zone/${battleId}`);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to join battle. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
