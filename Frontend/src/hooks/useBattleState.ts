import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBattleWebSocket } from './useBattleWebSocket';
import { BattleStatus } from '@/types/battle';

interface BattleState {
  status: BattleStatus;
  currentQuestion?: number;
  currentParticipants: number;
  participants: Array<{
    id: string;
    name: string;
    isReady: boolean;
  }>;
}

export const useBattleState = (battleId: string) => {
  const [state, setState] = useState<BattleState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { sendToBattle, isConnected } = useBattleWebSocket(
    'battle:state_update',
    battleId,
    useCallback((data) => {
      setState({
        status: data.status as BattleStatus,
        currentQuestion: data.current_question_index,
        currentParticipants: data.current_participants,
        participants: [], // This will be updated by participant_update events
      });
      setIsLoading(false);
    }, []),
  );

  // Initial state fetch
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch(`/battles/${battleId}/state`);
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error('Error fetching battle state:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch battle state',
        );
        toast({
          title: 'Error',
          description: 'Failed to fetch battle state',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [battleId, toast]);

  // Update participant status
  const updateParticipantStatus = useCallback(
    async (userId: string, isReady: boolean) => {
      try {
        await sendToBattle('battle:participant_ready', {
          user_id: userId,
          username: 'Current User', // This should be the current user's username
          avatar_url: '', // This should be the current user's avatar URL
          is_ready: isReady,
          status: isReady ? 'joined' : 'left',
          battle_id: battleId,
        });
        toast({
          title: 'Success',
          description: 'Status updated successfully',
        });
      } catch (error) {
        console.error('Error updating participant status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update participant status',
        });
      }
    },
    [sendToBattle, toast],
  );

  // Submit answer
  const submitAnswer = useCallback(
    async (questionId: string, answer: string, timeTaken: number) => {
      try {
        await sendToBattle('battle:answer', {
          question_id: questionId,
          user_id: battleId, // This should be the current user's ID
          answer,
          is_correct: true, // This should be determined by the server
          time_taken: timeTaken,
          battle_id: battleId,
        });
        toast({
          title: 'Success',
          description: 'Answer submitted successfully',
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit answer',
        });
      }
    },
    [battleId, sendToBattle, toast],
  );

  // Leave battle
  const leaveBattle = useCallback(async () => {
    try {
      await sendToBattle('battle:participant_leave', {
        user_id: battleId, // This should be the current user's ID
        username: 'Current User', // This should be the current user's username
        avatar_url: '', // This should be the current user's avatar URL
        status: 'left',
        battle_id: battleId,
      });
      toast({
        title: 'Success',
        description: 'Left battle successfully',
      });
    } catch (error) {
      console.error('Error leaving battle:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave battle',
      });
    }
  }, [battleId, sendToBattle, toast]);

  return {
    state,
    isLoading,
    error,
    isConnected,
    updateParticipantStatus,
    submitAnswer,
    leaveBattle,
  };
};
