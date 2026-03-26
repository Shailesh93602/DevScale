import { useState, useEffect, useCallback, useRef } from 'react';
import { useBattleSocket } from './useBattleWebSocket';
import { BattleStatus } from '@/types/battle';
import useBattleApi from './useBattleApi';

interface BattleState {
  status: BattleStatus;
  currentQuestion?: number;
  current_participants: number;
  participants: Array<{
    user_id: string;
    username: string;
    status: string;
  }>;
}

export const useBattleState = (battleId: string) => {
  const [state, setState] = useState<BattleState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchBattle } = useBattleApi();
  const fetchBattleRef = useRef(fetchBattle);
  fetchBattleRef.current = fetchBattle;
  const hasFetched = useRef(false);

  const { isConnected, on } = useBattleSocket(battleId);

  // Listen for status changes via socket
  useEffect(() => {
    return on('battle:status_changed', ({ status }) => {
      setState((prev) => prev ? { ...prev, status: status as BattleStatus } : prev);
    });
  }, [on]);

  // Listen for participant changes
  useEffect(() => {
    const offJoin = on('battle:participant_joined', ({ user, total_count }) => {
      setState((prev) => {
        if (!prev) return prev;
        const exists = prev.participants.some((p) => p.user_id === user.id);
        return {
          ...prev,
          current_participants: total_count,
          participants: exists ? prev.participants : [
            ...prev.participants,
            { user_id: user.id, username: user.username, status: 'JOINED' },
          ],
        };
      });
    });
    const offLeave = on('battle:participant_left', ({ user_id, total_count }) => {
      setState((prev) => prev ? {
        ...prev,
        current_participants: total_count,
        participants: prev.participants.filter((p) => p.user_id !== user_id),
      } : prev);
    });
    return () => { offJoin(); offLeave(); };
  }, [on]);

  // Initial state fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchBattleRef.current(battleId).then((battle) => {
      if (battle) {
        setState({
          status: battle.status,
          current_participants: battle.current_participants,
          participants: battle.participants.map((p) => ({
            user_id: p.user_id,
            username: p.user.username,
            status: p.status,
          })),
        });
      } else {
        setError('Failed to fetch battle state');
      }
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to fetch battle state');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [battleId]);

  const refresh = useCallback(async () => {
    const battle = await fetchBattleRef.current(battleId);
    if (battle) {
      setState({
        status: battle.status,
        current_participants: battle.current_participants,
        participants: battle.participants.map((p) => ({
          user_id: p.user_id,
          username: p.user.username,
          status: p.status,
        })),
      });
    }
  }, [battleId]);

  return { state, isLoading, error, isConnected, refresh };
};
