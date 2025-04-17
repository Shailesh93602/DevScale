'use client';

import { useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { BattleList } from '@/components/Battle/BattleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useBattleApi from '@/hooks/useBattleApi';

export default function MyBattlesPage() {
  const router = useRouter();
  const { joinExistingBattle } = useBattleApi();

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
          <h1 className="text-2xl font-bold">My Battles</h1>
          <p className="text-muted-foreground">
            Manage your created and joined battles
          </p>
        </div>

        <Tabs defaultValue="created">
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

          <TabsContent value="created" className="mt-6">
            <BattleList
              initialFilters={{
                user_id: 'current_user', // This would be replaced with actual user ID
                limit: 12,
                page: 1,
              }}
              onJoinBattle={handleJoinBattle}
            />
          </TabsContent>

          <TabsContent value="joined" className="mt-6">
            <BattleList
              initialFilters={{
                // This would filter for battles the user has joined
                limit: 12,
                page: 1,
              }}
              onJoinBattle={handleJoinBattle}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <BattleList
              initialFilters={{
                status: 'UPCOMING',
                // This would filter for battles the user is part of
                limit: 12,
                page: 1,
              }}
              onJoinBattle={handleJoinBattle}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <BattleList
              initialFilters={{
                status: 'completed',
                // This would filter for battles the user is part of
                limit: 12,
                page: 1,
              }}
              onJoinBattle={handleJoinBattle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </BattleZoneLayout>
  );
}
