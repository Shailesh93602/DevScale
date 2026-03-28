'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import {
  Battle,
  BattleQuestion,
  LeaderboardEntry,
  AnswerResult,
} from '@/types/battle';
import useBattleApi, { MyBattleResults } from '@/hooks/useBattleApi';
import {
  useBattleSocket,
  useBattleChat,
  useBattleTimer,
  useBattleLeaderboard,
} from '@/hooks/useBattleWebSocket';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  Award,
  AlertCircle,
  Timer,
  Trophy,
  Swords,
  Clock,
  CheckCircle2,
  Play,
  Crown,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

// ── Status badge colors ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  LOBBY: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  IN_PROGRESS: 'bg-green-500/10 text-green-500 border-green-500/20',
  COMPLETED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  LOBBY: 'Lobby — Get Ready',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const TYPE_LABELS: Record<string, string> = {
  QUICK: 'Quick',
  SCHEDULED: 'Scheduled',
  PRACTICE: 'Practice',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

// ── Option labels ──────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function BattleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    fetchBattle,
    fetchBattleQuestions,
    fetchBattleLeaderboard,
    joinExistingBattle,
    leaveExistingBattle,
    markReady,
    openLobby,
    startBattle,
    cancelBattle,
    submitBattleAnswer,
    fetchMyResults,
  } = useBattleApi();

  // ── State ────────────────────────────────────────────────────────────────

  const [battle, setBattle] = useState<Battle | null>(null);
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Battle playing state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const questionStartRef = useRef<number>(Date.now());

  // Leaderboard
  const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'battle' | 'leaderboard'>(
    'battle',
  );
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Post-battle results breakdown (P5.14)
  const [myResults, setMyResults] = useState<MyBattleResults | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const isParticipant =
    battle?.participants.some((p) => p.user_id === user?.id) ?? false;
  const isCreator = battle?.user_id === user?.id;
  const myParticipant = battle?.participants.find(
    (p) => p.user_id === user?.id,
  );
  const isReady = myParticipant?.status === 'READY';
  const allReady =
    (battle?.participants.length ?? 0) > 0 &&
    battle?.participants.every(
      (p) =>
        p.status === 'READY' ||
        p.status === 'PLAYING' ||
        p.status === 'COMPLETED',
    );
  const currentQuestion = questions[currentQuestionIndex] ?? null;

  // ── WebSocket hooks ──────────────────────────────────────────────────────

  const { isConnected, on, disconnect } = useBattleSocket(battleId);
  const { messages } = useBattleChat(battleId);
  const { secondsRemaining: wsSecondsRemaining } = useBattleTimer(battleId);
  const { leaderboard: wsLeaderboard, seedLeaderboard } =
    useBattleLeaderboard(battleId);

  // ── Socket cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId]);

  // ── Timer with local fallback ─────────────────────────────────────────────
  // If WS drops, derive remaining time locally from the ends_at timestamp.
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

  // Use WS value when available, fall back to local countdown
  const secondsRemaining =
    (wsSecondsRemaining ?? 0) > 0
      ? (wsSecondsRemaining ?? 0)
      : localSecondsRemaining;

  // ── WebSocket event listeners ────────────────────────────────────────────

  useEffect(() => {
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

    const offCompleted = on(
      'battle:completed',
      ({ winner_id, leaderboard }) => {
        setBattle((prev) =>
          prev ? { ...prev, status: 'COMPLETED', winner_id } : prev,
        );
        setApiLeaderboard(leaderboard);
        toast({
          title: 'Battle completed!',
          description:
            winner_id === user?.id ? '🏆 You won!' : 'Check the results.',
        });
        // Fetch per-question results for this user
        if (user?.id) {
          fetchMyResults(battleId).then((res) => {
            if (res) setMyResults(res);
          });
        }
      },
    );

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
              {
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
              },
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

    const offLeft = on(
      'battle:participant_left',
      ({ user_id, total_count }) => {
        setBattle((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            current_participants: total_count,
            participants: prev.participants.filter(
              (p) => p.user_id !== user_id,
            ),
          };
        });
      },
    );

    const offState = on('battle:state', (state) => {
      setBattle((prev) =>
        prev ? { ...prev, status: state.status as Battle['status'] } : prev,
      );
      if (state.current_question_index >= 0)
        setCurrentQuestionIndex(state.current_question_index);
      if (state.leaderboard.length > 0) setApiLeaderboard(state.leaderboard);
    });

    return () => {
      offStatus();
      offStarted();
      offQuestion();
      offAnswerResult();
      offCompleted();
      offJoined();
      offReady();
      offLeft();
      offState();
    };
  }, [battleId, on, toast, router, user?.id, currentQuestion]);

  // ── Initial data load ────────────────────────────────────────────────────

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
      if (b?.status === 'COMPLETED' && user?.id) {
        fetchMyResults(battleId).then((res) => {
          if (res) setMyResults(res);
        });
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId]);

  // Load questions when IN_PROGRESS and participant
  useEffect(() => {
    if (
      battle?.status === 'IN_PROGRESS' &&
      isParticipant &&
      questions.length === 0
    ) {
      fetchBattleQuestions(battleId).then((qs) => {
        if (qs) {
          setQuestions(qs);
          // Reset the answer timer from when questions actually loaded (REST path).
          // Without this, reconnecting users would get "time limit exceeded" errors
          // because timeTakenMs is measured from component mount, not from question load.
          questionStartRef.current = Date.now();
        }
      });
    }
  }, [
    battle?.status,
    isParticipant,
    battleId,
    questions.length,
    fetchBattleQuestions,
  ]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const res = await joinExistingBattle(battleId);
    setActionLoading(false);
    if (res.ok) {
      setBattle(res.battle);
      toast({ title: 'Joined battle!' });
    } else {
      toast({ title: res.message, variant: 'destructive' });
      // Re-fetch to sync enrollment status (e.g. already enrolled but UI didn't know)
      const refreshed = await fetchBattle(battleId);
      if (refreshed) setBattle(refreshed);
    }
  };

  const handleLeave = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await leaveExistingBattle(battleId);
    setActionLoading(false);
    router.push('/battle-zone');
  };

  const handleMarkReady = async () => {
    if (actionLoading || isReady) return;
    setActionLoading(true);
    const res = await markReady(battleId);
    setActionLoading(false);
    if (res) {
      setBattle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user_id === user?.id ? { ...p, status: 'READY' as const } : p,
          ),
        };
      });
      toast({ title: "You're ready!" });
    }
  };

  const handleOpenLobby = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const ok = await openLobby(battleId);
    setActionLoading(false);
    if (!ok) toast({ title: 'Could not open lobby', variant: 'destructive' });
    else setBattle((prev) => (prev ? { ...prev, status: 'LOBBY' } : prev));
  };

  const handleStartBattle = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    const ok = await startBattle(battleId);
    setActionLoading(false);
    if (!ok) toast({ title: 'Could not start battle', variant: 'destructive' });
  };

  const handleCancelBattle = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    await cancelBattle(battleId);
    setActionLoading(false);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || actionLoading) return;
    if (answeredQuestions.has(currentQuestion.id)) return;

    const timeTakenMs = Date.now() - questionStartRef.current;
    setActionLoading(true);
    const res = await submitBattleAnswer({
      battle_id: battleId,
      question_id: currentQuestion.id,
      selected_option: selectedOption,
      time_taken_ms: timeTakenMs,
    });
    setActionLoading(false);

    if (res) {
      setAnswerResult(res);
      setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]));
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const leaderboard = wsLeaderboard.length > 0 ? wsLeaderboard : apiLeaderboard;

  const formatDate = (d?: string | null) => {
    if (!d) return null;
    try {
      return format(new Date(d), 'MMM d, yyyy h:mm a');
    } catch {
      return null;
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <BattleZoneLayout>
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  if (!battle) {
    return (
      <BattleZoneLayout>
        <div className="flex flex-col items-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-bold">Battle not found</h2>
          <Button onClick={() => router.push('/battle-zone')}>
            Browse Battles
          </Button>
        </div>
      </BattleZoneLayout>
    );
  }

  // ── WAITING phase ─────────────────────────────────────────────────────────

  const renderWaiting = () => {
    const questionCount = battle._count?.questions ?? 0;
    const questionsReady = questionCount >= battle.total_questions;
    return (
      <div className="space-y-6">
        {isCreator && !questionsReady && (
          <div className="border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3 rounded-xl border p-4">
            <AlertCircle className="text-yellow-600 mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-yellow-700 font-semibold">
                Questions needed before starting
              </p>
              <p className="text-yellow-600 mt-0.5 text-sm">
                This battle has {questionCount} of {battle.total_questions}{' '}
                questions added. Players joined to the lobby cannot start until
                all questions are ready. Go back and add questions via the
                battle creation flow, or use the API.
              </p>
            </div>
          </div>
        )}
        <div className="space-y-4 rounded-xl border bg-card p-6 text-center">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-bold">Waiting for players</h2>
            <p className="mt-1 text-muted-foreground">
              {battle.current_participants} / {battle.max_participants} players
              joined
            </p>
          </div>
          {battle.start_time && (
            <p className="text-sm text-muted-foreground">
              Scheduled: {formatDate(battle.start_time)}
            </p>
          )}
          <Progress
            value={
              (battle.current_participants / battle.max_participants) * 100
            }
            className="h-2"
          />
        </div>

        {/* Participant list */}
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <h3 className="font-semibold">
            Participants ({battle.current_participants})
          </h3>
          {battle.participants.map((p) => (
            <div key={p.user_id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={p.user.avatar_url ?? ''} />
                <AvatarFallback>
                  {p.user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{p.user.username}</span>
              {p.user_id === battle.user_id && (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="mr-1 h-3 w-3" />
                  Creator
                </Badge>
              )}
              {p.user_id === user?.id && (
                <Badge variant="outline" className="ml-auto text-xs">
                  You
                </Badge>
              )}
            </div>
          ))}
          {battle.participants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No one has joined yet. Be the first!
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isParticipant ? (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleJoin}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Swords className="mr-2 h-4 w-4" />
              )}
              Join Battle
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleLeave}
              disabled={actionLoading}
            >
              Leave
            </Button>
          )}
          {isCreator && isParticipant && battle.current_participants >= 2 && (
            <Button
              size="sm"
              onClick={handleOpenLobby}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Open Lobby
            </Button>
          )}
          {isCreator && isParticipant && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelBattle}
              disabled={actionLoading}
            >
              Cancel Battle
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ── LOBBY phase ────────────────────────────────────────────────────────────

  const renderLobby = () => {
    const readyCount = battle.participants.filter(
      (p) => p.status === 'READY',
    ).length;
    const questionCount = battle._count?.questions ?? 0;
    const questionsReady = questionCount >= battle.total_questions;
    return (
      <div className="space-y-6">
        {isCreator && !questionsReady && (
          <div className="border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3 rounded-xl border p-4">
            <AlertCircle className="text-yellow-600 mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-yellow-700 font-semibold">
                Cannot start — questions missing
              </p>
              <p className="text-yellow-600 mt-0.5 text-sm">
                {questionCount} of {battle.total_questions} questions added. The
                Start Battle button is disabled until all questions are ready.
              </p>
            </div>
          </div>
        )}
        <div className="bg-yellow-500/5 border-yellow-500/20 space-y-3 rounded-xl border p-6 text-center">
          <Trophy className="text-yellow-500 mx-auto h-10 w-10" />
          <h2 className="text-xl font-bold">Lobby — Get Ready!</h2>
          <p className="text-muted-foreground">
            {readyCount} / {battle.participants.length} players ready
          </p>
          <Progress
            value={(readyCount / Math.max(battle.participants.length, 1)) * 100}
            className="h-2"
          />
        </div>

        {/* Participant ready status */}
        <div className="space-y-3 rounded-xl border bg-card p-6">
          {battle.participants.map((p) => (
            <div key={p.user_id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={p.user.avatar_url ?? ''} />
                <AvatarFallback>
                  {p.user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium">{p.user.username}</span>
              {p.user_id === battle.user_id && (
                <Crown className="text-yellow-500 h-4 w-4" />
              )}
              <Badge
                variant={p.status === 'READY' ? 'default' : 'outline'}
                className={
                  p.status === 'READY' ? 'bg-green-500 text-white' : ''
                }
              >
                {p.status === 'READY' ? '✓ Ready' : 'Not ready'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isParticipant && !isReady && (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleMarkReady}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Mark as Ready
            </Button>
          )}
          {isCreator && allReady && readyCount >= 2 && (
            <Button
              className="flex-1"
              size="lg"
              variant="default"
              onClick={handleStartBattle}
              disabled={actionLoading || !questionsReady}
              title={
                questionsReady
                  ? undefined
                  : `Add ${battle.total_questions - questionCount} more question(s) before starting`
              }
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {questionsReady
                ? 'Start Battle'
                : `Start Battle (${questionCount}/${battle.total_questions} questions)`}
            </Button>
          )}
          {isReady && isCreator && !(allReady && readyCount >= 2) && (
            <div className="bg-green-500/5 border-green-500/20 flex-1 rounded-lg border p-4 text-center">
              <p className="text-green-600 font-medium">
                ✓ You are ready. Waiting for others...
              </p>
            </div>
          )}
          {isReady && !isCreator && (
            <div className="bg-green-500/5 border-green-500/20 flex-1 rounded-lg border p-4 text-center">
              <p className="text-green-600 font-medium">
                ✓ You are ready. Waiting for others...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── IN_PROGRESS — question view ────────────────────────────────────────────

  const renderQuestion = () => {
    if (!currentQuestion) {
      return (
        <div className="flex flex-col items-center rounded-xl border bg-card py-12 text-center">
          <Swords className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No questions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This battle has no questions loaded. The creator needs to add
            questions.
          </p>
        </div>
      );
    }

    const isAnswered = answeredQuestions.has(currentQuestion.id);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} / {questions.length}
          </Badge>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span
              className={
                secondsRemaining !== null && secondsRemaining <= 10
                  ? 'font-bold text-destructive'
                  : ''
              }
            >
              {secondsRemaining ?? currentQuestion.time_limit}s
            </span>
          </div>
          <Badge variant="secondary">{currentQuestion.points} pts</Badge>
        </div>

        {/* Timer bar */}
        {secondsRemaining !== null && (
          <Progress
            value={(secondsRemaining / currentQuestion.time_limit) * 100}
            className="h-1"
          />
        )}

        {/* Question */}
        <div className="rounded-xl border bg-card p-6">
          <p className="text-lg font-semibold leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect =
              answerResult && idx === answerResult.correct_answer;
            const isWrong =
              answerResult && isSelected && !answerResult.is_correct;

            return (
              <button
                key={idx}
                onClick={() => !isAnswered && setSelectedOption(idx)}
                disabled={isAnswered}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${isCorrect ? 'border-green-500 bg-green-500/10 text-green-700' : ''} ${isWrong ? 'border-destructive bg-destructive/10 text-destructive' : ''} ${!isAnswered && isSelected ? 'bg-primary/10 border-primary' : ''} ${!isAnswered && !isSelected ? 'hover:border-primary/50 hover:bg-muted/50' : ''} ${isAnswered && !isCorrect && !isWrong ? 'opacity-60' : ''} `}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${isSelected && !isAnswered ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'} ${isCorrect ? 'border-green-500 bg-green-500 text-white' : ''} ${isWrong ? 'border-destructive bg-destructive text-white' : ''} `}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Answer feedback */}
        {answerResult && (
          <div
            className={`rounded-xl border p-4 ${answerResult.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}
          >
            <p
              className={`font-semibold ${answerResult.is_correct ? 'text-green-600' : 'text-destructive'}`}
            >
              {answerResult.is_correct
                ? `✓ Correct! +${answerResult.points_earned} points`
                : '✗ Incorrect — 0 points'}
            </p>
            {answerResult.explanation && (
              <p className="mt-1 text-sm text-muted-foreground">
                {answerResult.explanation}
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        {!isAnswered && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Answer
          </Button>
        )}

        {/* Next question hint */}
        {isAnswered && currentQuestionIndex < questions.length - 1 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
            Next question will appear automatically
          </div>
        )}
      </div>
    );
  };

  // ── COMPLETED ─────────────────────────────────────────────────────────────

  const renderCompleted = () => (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border bg-card p-8 text-center">
        {leaderboard[0]?.user_id === user?.id ? (
          <>
            <Crown className="text-yellow-500 mx-auto h-14 w-14" />
            <h2 className="text-2xl font-bold">You Won! 🎉</h2>
          </>
        ) : (
          <>
            <CheckCircle2 className="text-green-500 mx-auto h-14 w-12" />
            <h2 className="text-2xl font-bold">Battle Complete!</h2>
          </>
        )}
        <p className="text-muted-foreground">Final results are in.</p>
      </div>

      {/* Final leaderboard */}
      <div className="space-y-3 rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Final Standings</h3>
        {leaderboard.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 rounded-lg p-3 ${entry.user_id === user?.id ? 'bg-primary/5 border-primary/20 border' : 'border'}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              {i + 1}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.avatar_url ?? ''} />
              <AvatarFallback>
                {entry.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 font-medium">
              {entry.username}
              {entry.user_id === user?.id && (
                <span className="ml-2 text-xs text-primary">(You)</span>
              )}
            </span>
            <span className="font-bold">{entry.score} pts</span>
          </div>
        ))}
      </div>

      {/* Per-question breakdown (P5.14) */}
      {myResults && myResults.questions.length > 0 && (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Question Breakdown</h3>
            <span className="text-sm text-muted-foreground">
              {myResults.summary.correct_count}/
              {myResults.summary.total_questions} correct &nbsp;·&nbsp; avg{' '}
              {Math.round((myResults.summary.avg_time_ms ?? 0) / 1000)}
              s/question
            </span>
          </div>
          <div className="space-y-3">
            {myResults.questions.map((q, i) => (
              <div
                key={i}
                className={`space-y-3 rounded-lg border p-4 ${q.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${q.is_correct ? 'bg-green-500 text-white' : 'bg-destructive text-destructive-foreground'}`}
                  >
                    {q.is_correct ? '✓' : '✗'}
                  </span>
                  <p className="text-sm font-medium leading-snug">
                    {q.question_text}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pl-7">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`rounded-md border px-2.5 py-1.5 text-xs ${
                        idx === q.correct_answer
                          ? 'border-green-500/50 bg-green-500/10 text-green-700 font-medium'
                          : idx === q.selected_option && !q.is_correct
                            ? 'border-destructive/50 bg-destructive/10 text-destructive'
                            : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <span className="mr-1 font-bold">
                        {OPTION_LETTERS[idx]}.
                      </span>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 pl-7 text-xs text-muted-foreground">
                  <span>{Math.round(q.time_taken_ms / 1000)}s taken</span>
                  <span>{q.points_earned} pts earned</span>
                  <span className="ml-auto">
                    {q.community_accuracy_pct}% of players answered correctly
                  </span>
                </div>
                {q.explanation && (
                  <p className="border-t pl-7 pt-2 text-xs text-muted-foreground">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full" onClick={() => router.push('/battle-zone')}>
        Back to Battle Zone
      </Button>
    </div>
  );

  // ── Leaderboard tab ───────────────────────────────────────────────────────

  const renderLeaderboard = () => (
    <div className="space-y-3">
      {leaderboard.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No scores yet</p>
        </div>
      ) : (
        leaderboard.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 rounded-lg border p-4 ${entry.user_id === user?.id ? 'border-primary/40 bg-primary/5' : ''} ${i === 0 && entry.score > 0 ? 'border-yellow-500/30' : ''}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 && entry.score > 0 ? 'bg-yellow-500 text-white' : i === 1 && entry.score > 0 ? 'bg-gray-400 text-white' : i === 2 && entry.score > 0 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'}`}
            >
              {i + 1}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.avatar_url ?? ''} />
              <AvatarFallback>
                {entry.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {entry.username}
                {entry.user_id === user?.id && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.correct_count} correct
              </p>
            </div>
            <span className="font-bold">{entry.score} pts</span>
          </div>
        ))
      )}
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  const isBattlePhase =
    battle.status === 'IN_PROGRESS' || battle.status === 'COMPLETED';

  return (
    <BattleZoneLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Battle header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={STATUS_COLORS[battle.status] ?? ''}>
              {STATUS_LABELS[battle.status] ?? battle.status}
            </Badge>
            <Badge variant="outline">
              {TYPE_LABELS[battle.type] ?? battle.type}
            </Badge>
            <Badge variant="outline">
              {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
            </Badge>
            <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'}`}
              />
              {isConnected ? 'Live' : 'Connecting…'}
            </div>
          </div>

          <h1 className="text-2xl font-bold md:text-3xl">{battle.title}</h1>
          {battle.description && (
            <p className="text-muted-foreground">{battle.description}</p>
          )}

          <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={battle.creator.avatar_url ?? ''} />
                <AvatarFallback>
                  {battle.creator.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {battle.creator.username}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {battle.current_participants} / {battle.max_participants}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              {battle.topic?.title}
            </span>
            {battle.start_time && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(battle.start_time)}
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Tab bar (only for in-progress / completed) */}
        {isBattlePhase && (
          <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
            {(['battle', 'leaderboard'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab === 'battle'
                  ? battle.status === 'COMPLETED'
                    ? 'Results'
                    : 'Battle'
                  : 'Leaderboard'}
                {tab === 'leaderboard' && leaderboard.length > 0 && (
                  <span className="bg-primary/10 ml-1.5 rounded-full px-1.5 py-0.5 text-xs text-primary">
                    {leaderboard.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        {battle.status === 'WAITING' && renderWaiting()}
        {battle.status === 'LOBBY' && renderLobby()}
        {battle.status === 'CANCELLED' && (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Battle Cancelled</h2>
            <Button
              className="mt-4"
              onClick={() => router.push('/battle-zone')}
            >
              Browse Battles
            </Button>
          </div>
        )}
        {battle.status === 'IN_PROGRESS' && (
          <>
            {activeTab === 'battle' &&
              (isParticipant ? (
                renderQuestion()
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <Swords className="mb-4 h-10 w-10 text-muted-foreground" />
                  <h2 className="text-xl font-bold">Battle in progress</h2>
                  <p className="mt-1 text-muted-foreground">
                    You can watch the leaderboard.
                  </p>
                </div>
              ))}
            {activeTab === 'leaderboard' && renderLeaderboard()}
          </>
        )}
        {battle.status === 'COMPLETED' && (
          <>
            {activeTab === 'battle' && renderCompleted()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
          </>
        )}
      </div>
    </BattleZoneLayout>
  );
}
