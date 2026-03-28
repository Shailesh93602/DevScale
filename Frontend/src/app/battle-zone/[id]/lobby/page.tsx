'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Battle } from '@/types/battle';
import useBattleApi from '@/hooks/useBattleApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import BattleLobby from '../../Components/BattleLobby';
import { useAuth } from '@/contexts/AuthContext';

export default function BattleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchBattle, joinExistingBattle, leaveExistingBattle } =
    useBattleApi();
  const hasFetched = useRef(false);
  const fetchBattleRef = useRef(fetchBattle);
  fetchBattleRef.current = fetchBattle;
  const joinExistingBattleRef = useRef(joinExistingBattle);
  joinExistingBattleRef.current = joinExistingBattle;

  // Load battle details
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadBattle = async () => {
      setIsLoading(true);

      try {
        const response = await fetchBattleRef.current(battleId);

        if (response) {
          const battle = response;
          setBattle(battle);

          // If battle is already in progress, redirect to battle page
          if (battle.status === 'IN_PROGRESS') {
            toast({ title: 'Battle is already in progress. Redirecting...' });
            router.push(`/battle-zone/${battleId}`);
            return;
          }

          // If battle is completed, redirect to battle page
          if (battle.status === 'COMPLETED') {
            toast({ title: 'Battle is already completed. Redirecting...' });
            router.push(`/battle-zone/${battleId}`);
            return;
          }

          // Check if user has already joined
          const userParticipant = battle.participants?.find(
            (p) => p.user_id === user?.id,
          );

          // If user hasn't joined, join the battle
          if (!userParticipant) {
            await joinExistingBattleRef.current(battleId);
            toast({ title: 'You have joined the battle!' });

            // Refresh battle data
            const updatedResponse = await fetchBattleRef.current(battleId);
            if (updatedResponse) {
              setBattle(updatedResponse);
            }
          }
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load battle. Redirecting...',
          variant: 'destructive',
        });
        router.push('/battle-zone');
      } finally {
        setIsLoading(false);
      }
    };

    loadBattle();
  }, [battleId, router, user?.id, toast]);

  // Handle start battle
  const handleStartBattle = useCallback(() => {
    router.push(`/battle-zone/${battleId}`);
  }, [router, battleId]);

  // Handle leave battle
  const handleLeaveBattle = useCallback(async () => {
    try {
      await leaveExistingBattle(battleId);
      toast({ title: 'You have left the battle' });
      router.push('/battle-zone');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to leave battle',
        variant: 'destructive',
      });
    }
  }, [leaveExistingBattle, battleId, toast, router]);

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
          currentUserId={user?.id || ''}
          onStartBattle={handleStartBattle}
          onLeaveBattle={handleLeaveBattle}
        />
      )}
    </BattleZoneLayout>
  );
}
