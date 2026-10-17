'use client';

import { useMemo, useState } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { BattleList } from '@/components/Battle/BattleList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJoinAndEnterBattle } from '@/hooks/useJoinAndEnterBattle';
import { useAuth } from '@/contexts/AuthContext';
import { Battle, BattleFilters } from '@/types/battle';

export default function MyBattlesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'created' | 'joined' | 'upcoming' | 'completed'
  >('created');

  const handleJoinBattle = useJoinAndEnterBattle();

  // `/battles` has no participant filter, so every tab but "created" reads `/battles/my`.
  const view = useMemo<{
    filters: BattleFilters;
    select?: (battle: Battle) => boolean;
  }>(() => {
    const page = { limit: 12, page: 1 };
    switch (activeTab) {
      case 'created':
        return { filters: { user_id: user?.id, ...page } };
      case 'upcoming':
        return {
          filters: page,
          select: (b) => b.status === 'WAITING' || b.status === 'LOBBY',
        };
      case 'completed':
        return { filters: page, select: (b) => b.status === 'COMPLETED' };
      case 'joined':
      default:
        return { filters: page, select: (b) => b.user_id !== user?.id };
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
          initialFilters={view.filters}
          scope={activeTab === 'created' ? 'all' : 'mine'}
          select={view.select}
          onJoinBattle={handleJoinBattle}
        />
      </div>
    </BattleZoneLayout>
  );
}
