import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react';
import type { useRouter } from 'next/navigation';
import type {
  AnswerResult,
  Battle,
  BattleParticipant,
  BattleQuestion,
  BattleUser,
  LeaderboardEntry,
} from '@/types/battle';
import type useBattleApi from '@/hooks/useBattleApi';
import type { MyBattleResults } from '@/hooks/useBattleApi';
import type { useBattleSocket } from '@/hooks/useBattleWebSocket';
import type { useToast } from '@/hooks/use-toast';

type BattleOn = ReturnType<typeof useBattleSocket>['on'];
type SetBattle = Dispatch<SetStateAction<Battle | null>>;

interface BattleSocketEventDeps {
  battleId: string;
  on: BattleOn;
  toast: ReturnType<typeof useToast>['toast'];
  router: ReturnType<typeof useRouter>;
  userId: string | undefined;
  currentQuestion: BattleQuestion | null;
  questionStartRef: MutableRefObject<number>;
  setBattle: SetBattle;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
  setSelectedOption: Dispatch<SetStateAction<number | null>>;
  setAnswerResult: Dispatch<SetStateAction<AnswerResult | null>>;
  setAnsweredQuestions: Dispatch<SetStateAction<Set<string>>>;
  setApiLeaderboard: Dispatch<SetStateAction<LeaderboardEntry[]>>;
  setMyResults: Dispatch<SetStateAction<MyBattleResults | null>>;
  fetchMyResults: ReturnType<typeof useBattleApi>['fetchMyResults'];
}

function joinedParticipant(
  battleId: string,
  joinedUser: Pick<BattleUser, 'id' | 'username' | 'avatar_url'>,
): BattleParticipant {
  return {
    id: joinedUser.id,
    battle_id: battleId,
    user_id: joinedUser.id,
    user: {
      id: joinedUser.id,
      username: joinedUser.username,
      avatar_url: joinedUser.avatar_url,
    },
    status: 'JOINED' as const,
    score: 0,
    rank: 0,
    correct_count: 0,
    wrong_count: 0,
    avg_time_per_answer_ms: 0,
  };
}

/** Roster events: participants joining, readying up and leaving. */
function subscribeRoster(on: BattleOn, battleId: string, setBattle: SetBattle) {
  const offJoined = on(
    'battle:participant_joined',
    ({ user: joinedUser, total_count }) => {
      setBattle((prev) => {
        if (!prev) return prev;
        const alreadyIn = prev.participants.some(
          (p) => p.user_id === joinedUser.id,
        );
        if (alreadyIn) return { ...prev, current_participants: total_count };
        return {
          ...prev,
          current_participants: total_count,
          participants: [
            ...prev.participants,
            joinedParticipant(battleId, joinedUser),
          ],
        };
      });
    },
  );

  const offReady = on('battle:participant_ready', ({ user_id }) => {
    setBattle((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map((p) =>
          p.user_id === user_id ? { ...p, status: 'READY' as const } : p,
        ),
      };
    });
  });

  const offLeft = on('battle:participant_left', ({ user_id, total_count }) => {
    setBattle((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        current_participants: total_count,
        participants: prev.participants.filter((p) => p.user_id !== user_id),
      };
    });
  });

  return [offJoined, offReady, offLeft];
}

/** Lifecycle events: status changes, start, completion and state replay. */
function subscribeLifecycle(deps: BattleSocketEventDeps) {
  const {
    on,
    battleId,
    toast,
    router,
    userId,
    setBattle,
    setApiLeaderboard,
    setCurrentQuestionIndex,
    setMyResults,
    fetchMyResults,
  } = deps;

  const offStatus = on('battle:status_changed', ({ status }) => {
    setBattle((prev) =>
      prev ? { ...prev, status: status as Battle['status'] } : prev,
    );
    if (status === 'LOBBY') {
      toast({
        title: 'Battle lobby is open!',
        description: 'Mark yourself ready when you are prepared.',
      });
    }
    if (status === 'CANCELLED') {
      toast({ title: 'Battle cancelled', variant: 'destructive' });
      router.push('/battle-zone');
    }
  });

  const offStarted = on('battle:started', () => {
    setBattle((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : prev));
    toast({ title: 'Battle started! Good luck!' });
  });

  const offCompleted = on('battle:completed', ({ winner_id, leaderboard }) => {
    setBattle((prev) =>
      prev ? { ...prev, status: 'COMPLETED', winner_id } : prev,
    );
    setApiLeaderboard(leaderboard);
    toast({
      title: 'Battle completed!',
      description: winner_id === userId ? '🏆 You won!' : 'Check the results.',
    });
    // Fetch per-question results for this user
    if (userId) {
      fetchMyResults(battleId).then((res) => {
        if (res) setMyResults(res);
      });
    }
  });

  const offState = on('battle:state', (state) => {
    setBattle((prev) =>
      prev ? { ...prev, status: state.status as Battle['status'] } : prev,
    );
    if (state.current_question_index >= 0)
      setCurrentQuestionIndex(state.current_question_index);
    if (state.leaderboard.length > 0) setApiLeaderboard(state.leaderboard);
  });

  return [offStatus, offStarted, offCompleted, offState];
}

/** Question events: a new question arriving and the server's verdict on ours. */
function subscribeQuestions(deps: BattleSocketEventDeps) {
  const {
    on,
    currentQuestion,
    questionStartRef,
    setCurrentQuestionIndex,
    setSelectedOption,
    setAnswerResult,
    setAnsweredQuestions,
  } = deps;

  const offQuestion = on('battle:question', (data) => {
    setCurrentQuestionIndex(data.index);
    setSelectedOption(null);
    setAnswerResult(null);
    questionStartRef.current = Date.now();
  });

  const offAnswerResult = on('battle:answer_result', (result) => {
    setAnswerResult(result);
    setAnsweredQuestions((prev) => {
      const next = new Set(prev);
      if (currentQuestion) next.add(currentQuestion.id);
      return next;
    });
  });

  return [offQuestion, offAnswerResult];
}

/** Wires every battle-room socket event into the page's state. */
export function useBattleSocketEvents(deps: BattleSocketEventDeps) {
  const { battleId, on, toast, router, userId, currentQuestion } = deps;

  useEffect(() => {
    const offs = [
      ...subscribeLifecycle(deps),
      ...subscribeQuestions(deps),
      ...subscribeRoster(on, battleId, deps.setBattle),
    ];
    return () => {
      offs.forEach((off) => off());
    };
  }, [battleId, on, toast, router, userId, currentQuestion]);
}
