'use client';

import { useSearchParams } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { BattleList } from '@/components/Battle/BattleList';
import { BattleFilters } from '@/types/battle';
import { useJoinAndEnterBattle } from '@/hooks/useJoinAndEnterBattle';

export default function BattlesPage() {
  const searchParams = useSearchParams();

  // Parse search params for initial filters
  const initialFilters: BattleFilters = {
    status:
      (searchParams.get('status') as BattleFilters['status']) || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: 12,
    sort_by: searchParams.get('sort_by') || undefined,
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
  };

  const handleJoinBattle = useJoinAndEnterBattle();

  return (
    <BattleZoneLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">All Battles</h1>
          <p className="text-muted-foreground">
            Browse and join battles from the community
          </p>
        </div>

        <BattleList
          initialFilters={initialFilters}
          onJoinBattle={handleJoinBattle}
        />
      </div>
    </BattleZoneLayout>
  );
}
