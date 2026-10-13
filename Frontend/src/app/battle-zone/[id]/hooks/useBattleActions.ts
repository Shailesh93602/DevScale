import { Dispatch, MutableRefObject, SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AnswerResult, Battle, BattleQuestion } from '@/types/battle';
import type useBattleApi from '@/hooks/useBattleApi';
import { useToast } from '@/hooks/use-toast';

interface BattleActionDeps {
  api: ReturnType<typeof useBattleApi>;
  battleId: string;
  userId: string | undefined;
  isReady: boolean;
  currentQuestion: BattleQuestion | null;
  selectedOption: number | null;
  answeredQuestions: Set<string>;
  questionStartRef: MutableRefObject<number>;
  setBattle: Dispatch<SetStateAction<Battle | null>>;
  setAnswerResult: Dispatch<SetStateAction<AnswerResult | null>>;
  setAnsweredQuestions: Dispatch<SetStateAction<Set<string>>>;
}

/** The user-triggered battle actions, sharing one in-flight guard. */
export function useBattleActions(deps: BattleActionDeps) {
  const { api, battleId, userId, isReady, setBattle } = deps;
  const router = useRouter();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const handleJoin = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const res = await api.joinExistingBattle(battleId);
    setActionLoading(false);
    if (res.ok) {
      setBattle(res.battle);
      toast({ title: 'Joined battle!' });
    } else {
      toast({ title: res.message, variant: 'destructive' });
      // Re-fetch to sync enrollment status (e.g. already enrolled but UI didn't know)
      const refreshed = await api.fetchBattle(battleId);
      if (refreshed) setBattle(refreshed);
    }
  };

  const handleLeave = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await api.leaveExistingBattle(battleId);
    setActionLoading(false);
    router.push('/battle-zone');
  };

  const handleMarkReady = async () => {
    if (actionLoading || isReady) return;
    setActionLoading(true);
    const res = await api.markReady(battleId);
    setActionLoading(false);
    if (res) {
      setBattle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user_id === userId ? { ...p, status: 'READY' as const } : p,
          ),
        };
      });
      toast({ title: "You're ready!" });
    }
  };

  const handleOpenLobby = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const ok = await api.openLobby(battleId);
    setActionLoading(false);
    if (!ok) toast({ title: 'Could not open lobby', variant: 'destructive' });
    else setBattle((prev) => (prev ? { ...prev, status: 'LOBBY' } : prev));
  };

  const handleStartBattle = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const ok = await api.startBattle(battleId);
    setActionLoading(false);
    if (!ok) toast({ title: 'Could not start battle', variant: 'destructive' });
  };

  const handleCancelBattle = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await api.cancelBattle(battleId);
    setActionLoading(false);
  };

  const handleSubmitAnswer = async () => {
    const { currentQuestion, selectedOption, answeredQuestions } = deps;
    if (selectedOption === null || !currentQuestion || actionLoading) return;
    if (answeredQuestions.has(currentQuestion.id)) return;

    const timeTakenMs = Date.now() - deps.questionStartRef.current;
    setActionLoading(true);
    const res = await api.submitBattleAnswer({
      battle_id: battleId,
      question_id: currentQuestion.id,
      selected_option: selectedOption,
      time_taken_ms: timeTakenMs,
    });
    setActionLoading(false);

    if (res) {
      deps.setAnswerResult(res);
      deps.setAnsweredQuestions(
        (prev) => new Set([...prev, currentQuestion.id]),
      );
    }
  };

  return {
    actionLoading,
    handleJoin,
    handleLeave,
    handleMarkReady,
    handleOpenLobby,
    handleStartBattle,
    handleCancelBattle,
    handleSubmitAnswer,
  };
}
