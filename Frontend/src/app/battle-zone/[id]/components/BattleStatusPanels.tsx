import type { ReactNode } from 'react';
import { AlertCircle, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';

export function BattleDetailSkeleton() {
  return (
    <BattleZoneLayout>
      <div className="animate-pulse space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    </BattleZoneLayout>
  );
}

export function BattleNotFound({ onBrowse }: { onBrowse: () => void }) {
  return (
    <BattleZoneLayout>
      <div className="flex flex-col items-center py-20 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold">Battle not found</h2>
        <Button onClick={onBrowse}>Browse Battles</Button>
      </div>
    </BattleZoneLayout>
  );
}

export function BattleCancelledPanel({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold">Battle Cancelled</h2>
      <Button className="mt-4" onClick={onBrowse}>
        Browse Battles
      </Button>
    </div>
  );
}

export function SpectatorPanel(): ReactNode {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Swords className="mb-4 h-10 w-10 text-muted-foreground" />
      <h2 className="text-xl font-bold">Battle in progress</h2>
      <p className="mt-1 text-muted-foreground">
        You can watch the leaderboard.
      </p>
    </div>
  );
}
