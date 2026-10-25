import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AnswerResult,
  Battle,
  BattleQuestion,
  LeaderboardEntry,
} from '@/types/battle';
import useBattleApi, { MyBattleResults } from '@/hooks/useBattleApi';
import {
  useBattleChat,
  useBattleLeaderboard,
  useBattleSocket,
  useBattleTimer,
} from '@/hooks/useBattleWebSocket';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBattleSocketEvents } from './useBattleSocketEvents';
import { useBattleActions } from './useBattleActions';
import { restoredResult, type RestoredAnswers } from './restoredAnswers';

type BattleOn = ReturnType<typeof useBattleSocket>['on'];

/** WS countdown, falling back to a local one derived from `ends_at` if the socket drops. */
function useQuestionCountdown(
  on: BattleOn,
  wsSecondsRemaining: number | null | undefined,
): number {
  const [questionEndsAt, setQuestionEndsAt] = useState<number | null>(null);
  const [localSecondsRemaining, setLocalSecondsRemaining] = useState(0);

  // Update ends_at when WS broadcasts a new question
  useEffect(() => {
    const offQuestion = on('battle:question', (data: { ends_at: number }) => {
      setQuestionEndsAt(data.ends_at);
    });
    return offQuestion;
  }, [on]);

  // Drive local countdown from ends_at
  useEffect(() => {
    if (!questionEndsAt) return;
    const tick = setInterval(() => {
      setLocalSecondsRemaining(
        Math.max(0, Math.ceil((questionEndsAt - Date.now()) / 1000)),
      );
    }, 500);
    return () => clearInterval(tick);
  }, [questionEndsAt]);

  return (wsSecondsRemaining ?? 0) > 0
    ? (wsSecondsRemaining ?? 0)
    : localSecondsRemaining;
}

function deriveMembership(battle: Battle | null, userId: string | undefined) {
  // No User.id yet (profile not loaded): nobody, rather than undefined === undefined.
  const isParticipant =
    !!userId &&
    (battle?.participants.some((p) => p.user_id === userId) ?? false);
  const isCreator = !!userId && battle?.user_id === userId;
  const myParticipant = userId
    ? battle?.participants.find((p) => p.user_id === userId)
    : undefined;
  const isReady = myParticipant?.status === 'READY';
  const allReady =
    (battle?.participants.length ?? 0) > 0 &&
    battle?.participants.every(
      (p) =>
        p.status === 'READY' ||
        p.status === 'PLAYING' ||
        p.status === 'COMPLETED',
    );
  return { isParticipant, isCreator, isReady, allReady: !!allReady };
}

interface DataLoadDeps {
  battleId: string;
  api: ReturnType<typeof useBattleApi>;
  router: ReturnType<typeof useRouter>;
  userId: string | undefined;
  battleStatus: Battle['status'] | undefined;
  isParticipant: boolean;
  questionCount: number;
  questionStartRef: MutableRefObject<number>;
  seedLeaderboard: (entries: LeaderboardEntry[]) => void;
  setBattle: Dispatch<SetStateAction<Battle | null>>;
  setQuestions: Dispatch<SetStateAction<BattleQuestion[]>>;
  setApiLeaderboard: Dispatch<SetStateAction<LeaderboardEntry[]>>;
  setMyResults: Dispatch<SetStateAction<MyBattleResults | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

/** REST loads: the battle + leaderboard on mount, the questions once the battle is live. */
function useBattleDataLoad(deps: DataLoadDeps) {
  const {
    battleId,
    router,
    userId,
    battleStatus,
    isParticipant,
    questionCount,
    questionStartRef,
    seedLeaderboard,
    setBattle,
    setQuestions,
    setApiLeaderboard,
    setMyResults,
    setLoading,
  } = deps;
  const {
    fetchBattle,
    fetchBattleQuestions,
    fetchBattleLeaderboard,
    fetchMyResults,
  } = deps.api;

  // Initial data load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [b, lb] = await Promise.all([
        fetchBattle(battleId),
        fetchBattleLeaderboard(battleId),
      ]);
      if (b) {
        setBattle(b);
        // Canonicalize URL to UUID so socket room connections use the right ID
        if (b.id !== battleId) {
          router.replace(`/battle-zone/${b.id}`);
          return;
        }
      }
      if (lb) {
        setApiLeaderboard(lb);
        seedLeaderboard(lb);
      }
      // If loading a completed battle, fetch the per-user results breakdown
      if (b?.status === 'COMPLETED' && userId) {
        fetchMyResults(battleId).then((res) => {
          if (res) setMyResults(res);
        });
      }
      setLoading(false);
    };
    load();
  }, [battleId]);

  // Load questions when IN_PROGRESS and participant
  useEffect(() => {
    if (
      battleStatus === 'IN_PROGRESS' &&
      isParticipant &&
      questionCount === 0
    ) {
      fetchBattleQuestions(battleId).then((qs) => {
        if (qs) {
          setQuestions(qs);
          // Restart the answer clock from question load (REST path), not mount,
          // or reconnecting users get "time limit exceeded".
          questionStartRef.current = Date.now();
        }
      });
    }
  }, [
    battleStatus,
    isParticipant,
    battleId,
    questionCount,
    fetchBattleQuestions,
  ]);
}

/** All state, socket wiring and actions behind the battle detail page. */
export function useBattleDetail() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;
  const { userId: authUserId } = useAuth();
  const userId = authUserId ?? undefined;
  const { toast } = useToast();
  const api = useBattleApi();
  const { fetchMyResults } = api;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const questionStartRef = useRef<number>(Date.now());
  const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'battle' | 'leaderboard'>(
    'battle',
  );
  // Post-battle results breakdown (P5.14)
  const [myResults, setMyResults] = useState<MyBattleResults | null>(null);
  // Answers replayed by `battle:state` after a reconnect or reload.
  const [restoredAnswers, setRestoredAnswers] = useState<RestoredAnswers>({});

  const membership = deriveMembership(battle, userId);
  const currentQuestion = questions[currentQuestionIndex] ?? null;

  const { isConnected, on, disconnect } = useBattleSocket(battleId);
  // Chat subscription kept for its socket listener; the page renders no chat.
  useBattleChat(battleId);
  const { secondsRemaining: wsSecondsRemaining } = useBattleTimer(battleId);
  const { leaderboard: wsLeaderboard, seedLeaderboard } =
    useBattleLeaderboard(battleId);

  // Socket cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [battleId]);

  const secondsRemaining = useQuestionCountdown(on, wsSecondsRemaining);

  useBattleSocketEvents({
    battleId,
    on,
    toast,
    router,
    userId,
    currentQuestion,
    questionStartRef,
    setBattle,
    setCurrentQuestionIndex,
    setSelectedOption,
    setAnswerResult,
    setAnsweredQuestions,
    setApiLeaderboard,
    setMyResults,
    setRestoredAnswers,
    fetchMyResults,
  });

  useEffect(() => {
    const ids = Object.keys(restoredAnswers);
    if (ids.length === 0) return;
    setAnsweredQuestions((prev) => new Set([...prev, ...ids]));
    const restored = restoredResult(restoredAnswers, currentQuestion?.id);
    if (restored) {
      setSelectedOption(restored.selectedOption);
      setAnswerResult((prev) => prev ?? restored.result);
    }
  }, [restoredAnswers, currentQuestion?.id]);

  useBattleDataLoad({
    battleId,
    api,
    router,
    userId,
    battleStatus: battle?.status,
    isParticipant: membership.isParticipant,
    questionCount: questions.length,
    questionStartRef,
    seedLeaderboard,
    setBattle,
    setQuestions,
    setApiLeaderboard,
    setMyResults,
    setLoading,
  });

  const actions = useBattleActions({
    api,
    battleId,
    userId,
    isReady: membership.isReady,
    currentQuestion,
    selectedOption,
    answeredQuestions,
    questionStartRef,
    setBattle,
    setAnswerResult,
    setAnsweredQuestions,
  });

  return {
    router,
    userId,
    battle,
    questions,
    loading,
    ...membership,
    currentQuestion,
    currentQuestionIndex,
    selectedOption,
    setSelectedOption,
    answerResult,
    answeredQuestions,
    secondsRemaining,
    leaderboard: wsLeaderboard.length > 0 ? wsLeaderboard : apiLeaderboard,
    activeTab,
    setActiveTab,
    myResults,
    isConnected,
    ...actions,
  };
}

export type BattleDetailState = ReturnType<typeof useBattleDetail>;
