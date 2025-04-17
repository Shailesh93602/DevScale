'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { BattleList } from '@/components/Battle/BattleList';
import { BattleFilters } from '@/types/battle';
import useBattleApi from '@/hooks/useBattleApi';

export default function BattlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinExistingBattle } = useBattleApi();

  // Parse search params for initial filters
  const initialFilters: BattleFilters = {
    status:
      (searchParams.get('status') as
        | 'pending'
        | 'active'
        | 'completed'
        | 'cancelled'
        | 'UPCOMING'
        | 'IN_PROGRESS'
        | 'all') || undefined,
    length:
      (searchParams.get('length') as 'short' | 'medium' | 'long') || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: 12,
    sortBy:
      (searchParams.get('sort_by') as 'createdAt' | 'participants' | 'prize') ||
      'createdAt',
    sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
  };

  const handleJoinBattle = async (battleId: string, status?: string) => {
    try {
      const response = await joinExistingBattle(battleId);
      if (response) {
        // If battle is upcoming, redirect to lobby
        if (status === 'UPCOMING') {
          router.push(`/battle-zone/${battleId}/lobby`);
        } else {
          router.push(`/battle-zone/${battleId}`);
        }
      }
    } catch (error) {
      console.error('Failed to join battle:', error);
    }
  };

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
