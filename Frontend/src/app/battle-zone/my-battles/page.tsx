'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { BattleList } from '@/components/Battle/BattleList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useBattleApi from '@/hooks/useBattleApi';
import { useAuth } from '@/contexts/AuthContext';
import { BattleFilters } from '@/types/battle';

export default function MyBattlesPage() {
  const router = useRouter();
  const { joinExistingBattle } = useBattleApi();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'created' | 'joined' | 'upcoming' | 'completed'
  >('created');

  const handleJoinBattle = async (battleId: string, status?: string) => {
    try {
      const response = await joinExistingBattle(battleId);
      if (response) {
        router.push(`/battle-zone/${battleId}`);
      }
    } catch (error) {
      console.error('Failed to join battle:', error);
    }
  };

  const activeFilters = useMemo<BattleFilters>(() => {
    switch (activeTab) {
      case 'created':
        return {
          user_id: user?.id,
          limit: 12,
          page: 1,
        };
      case 'upcoming':
        return {
          status: 'WAITING' as const,
          limit: 12,
          page: 1,
        };
      case 'completed':
        return {
          status: 'COMPLETED',
          limit: 12,
          page: 1,
        };
      case 'joined':
      default:
        return {
          limit: 12,
          page: 1,
        };
    }
  }, [activeTab, user?.id]);

  return (
    <BattleZoneLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Battles</h1>
          <p className="text-muted-foreground">
            Manage your created and joined battles
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as 'created' | 'joined' | 'upcoming' | 'completed',
            )
          }
        >
          <TabsList className="w-full">
            <TabsTrigger value="created" className="flex-1">
              Created by Me
            </TabsTrigger>
            <TabsTrigger value="joined" className="flex-1">
              Joined by Me
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <BattleList
          initialFilters={activeFilters}
          onJoinBattle={handleJoinBattle}
        />
      </div>
    </BattleZoneLayout>
  );
}
