'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Battle } from '@/types/battle';
import useBattleApi from '@/hooks/useBattleApi';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';
import BattleLobby from '../../Components/BattleLobby';

export default function BattleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchBattle, joinExistingBattle, leaveExistingBattle } =
    useBattleApi();

  // Load battle details
  useEffect(() => {
    const loadBattle = async () => {
      setIsLoading(true);

      try {
        const response = await fetchBattle(battleId);

        if (response?.data) {
          const battle = response.data[0];
          setBattle(battle);

          // If battle is already in progress, redirect to battle page
          if (battle.status === 'IN_PROGRESS') {
            toast.info('Battle is already in progress. Redirecting...');
            router.push(`/battle-zone/${battleId}`);
            return;
          }

          // If battle is completed, redirect to battle page
          if (battle.status === 'completed') {
            toast.info('Battle is already completed. Redirecting...');
            router.push(`/battle-zone/${battleId}`);
            return;
          }

          // Check if user has already joined
          const userParticipant = battle.participants?.find(
            (p) => p.userId === 'current_user', // Replace with actual user ID
          );

          // If user hasn't joined, join the battle
          if (!userParticipant) {
            await joinExistingBattle(battleId);
            toast.success('You have joined the battle!');

            // Refresh battle data
            const updatedResponse = await fetchBattle(battleId);
            if (updatedResponse?.data) {
              setBattle(updatedResponse.data[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load battle:', error);
        toast.error('Failed to load battle. Redirecting to battle zone...');
        router.push('/battle-zone');
      } finally {
        setIsLoading(false);
      }
    };

    loadBattle();
  }, [battleId, fetchBattle, joinExistingBattle, router]);

  // Handle start battle
  const handleStartBattle = () => {
    router.push(`/battle-zone/${battleId}`);
  };

  // Handle leave battle
  const handleLeaveBattle = async () => {
    try {
      await leaveExistingBattle(battleId);
      toast.success('You have left the battle');
      router.push('/battle-zone');
    } catch (error) {
      console.error('Failed to leave battle:', error);
      toast.error('Failed to leave battle');
    }
  };

  return (
    <BattleZoneLayout>
      {isLoading || !battle ? (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <Skeleton className="h-16 w-full" />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </div>
      ) : (
        <BattleLobby
          battle={battle}
          currentUserId="current_user" // Replace with actual user ID
          onStartBattle={handleStartBattle}
          onLeaveBattle={handleLeaveBattle}
        />
      )}
    </BattleZoneLayout>
  );
}
