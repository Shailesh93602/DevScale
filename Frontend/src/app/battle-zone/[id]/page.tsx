'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Battle, BattleQuestion } from '@/types/battle';
import useBattleApi from '@/hooks/useBattleApi';
import {
  useBattleWebSocket,
  useBattleTimer,
  useBattleLeaderboard,
  useBattleChat,
} from '@/hooks/useBattleWebSocket';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Calendar,
  Award,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  Timer,
  Trophy,
  Info,
  MessageSquare,
  Play,
  Swords,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import custom components
import BattleInformation from '../Components/BattleInformation';
import ParticipantList from '../Components/ParticipantList';
import QuestionPreview from '../Components/QuestionPreview';
import BattleRules from '../Components/BattleRules';

export default function BattleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const {
    fetchBattle,
    fetchBattleQuestions,
    joinExistingBattle,
    submitBattleAnswer,
    isLoading,
    error,
  } = useBattleApi();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // WebSocket hooks
  const { timeRemaining } = useBattleTimer(battleId);
  const leaderboard = useBattleLeaderboard(battleId);
  const { messages, sendMessage } = useBattleChat(battleId);
  const { sendToBattle } = useBattleWebSocket(
    'battle:state_update',
    battleId,
    () => {},
  );

  // Load battle details
  useEffect(() => {
    const loadBattle = async () => {
      const response = await fetchBattle(battleId);
      if (response?.data) {
        setBattle(response.data[0]);

        // Check if user has already joined
        const userParticipant = response.data[0].participants?.find(
          (p) => p.userId === 'current_user', // Replace with actual user ID
        );
        setHasJoined(!!userParticipant);
      }
    };

    loadBattle();
  }, [battleId, fetchBattle]);

  // Load battle questions
  useEffect(() => {
    const loadQuestions = async () => {
      if (hasJoined) {
        const response = await fetchBattleQuestions(battleId);
        if (response) {
          setQuestions(response.data);
        }
      }
    };

    if (hasJoined) {
      loadQuestions();
    }
  }, [battleId, fetchBattleQuestions, hasJoined]);

  // Handle join battle
  const handleJoinBattle = async () => {
    try {
      const response = await joinExistingBattle(battleId);
      if (response) {
        // If battle is upcoming, redirect to lobby
        if (battle?.status === 'UPCOMING') {
          toast.success('Joining battle lobby...');
          router.push(`/battle-zone/${battleId}/lobby`);
          return;
        }

        setHasJoined(true);
        toast.success('Successfully joined the battle!');

        // Notify other participants via WebSocket
        sendToBattle('battle:join', { battle_id: battleId });
      }
    } catch (error) {
      toast.error('Failed to join battle');
      console.error('Failed to join battle:', error);
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || submitting || !questions[currentQuestionIndex])
      return;

    setSubmitting(true);
    try {
      const response = await submitBattleAnswer({
        battle_id: battleId,
        question_id: questions[currentQuestionIndex].id,
        answer: selectedAnswer,
        time_taken:
          questions[currentQuestionIndex].time_limit - (timeRemaining || 0),
      });

      if (response) {
        toast.success('Answer submitted!');
        setSelectedAnswer(null);

        // Move to next question if not the last one
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }
    } catch (error) {
      toast.error('Failed to submit answer');
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle send chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const message = input.value.trim();

    if (message) {
      sendMessage(message);
      input.value = '';
    }
  };

  // Render loading state
  if (isLoading || !battle) {
    return (
      <BattleZoneLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <BattleZoneLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-bold">Error Loading Battle</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </BattleZoneLayout>
    );
  }

  // Format dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Render current question
  const renderCurrentQuestion = () => {
    if (!hasJoined) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-2 text-2xl font-bold">Join to See Questions</h2>
          <p className="mb-6 text-muted-foreground">
            You need to join this battle to see and answer questions.
          </p>
          <Button
            onClick={handleJoinBattle}
            disabled={battle.status !== 'UPCOMING'}
          >
            Join Battle
          </Button>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">No Questions Available</h2>
          <p className="text-muted-foreground">
            Questions will be available when the battle starts.
          </p>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Question {currentQuestionIndex + 1}/{questions.length}
            </Badge>
            <Badge variant="outline">Points: {currentQuestion.points}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {timeRemaining || currentQuestion.time_limit}s
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-xl font-semibold">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-md border p-4 transition-colors ${
                  selectedAnswer === option
                    ? 'bg-primary/10 border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedAnswer(option)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      selectedAnswer === option
                        ? 'border-primary bg-primary text-primary-foreground'
                        : ''
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>

            <Button
              variant="outline"
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render leaderboard
  const renderLeaderboard = () => {
    if (leaderboard.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-bold">No Participants Yet</h2>
          <p className="text-muted-foreground">
            Leaderboard will be available when participants join and submit
            answers.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              index === 0
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {entry.rank}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={entry.username} />
                <AvatarFallback>
                  {entry.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{entry.username}</span>
            </div>
            <div className="font-bold">{entry.score} pts</div>
          </div>
        ))}
      </div>
    );
  };

  // Render chat
  const renderChat = () => {
    return (
      <div className="flex h-[400px] flex-col rounded-lg border">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.avatar_url}
                      alt={message.username}
                    />
                    <AvatarFallback>
                      {message.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <form onSubmit={handleSendMessage} className="flex p-4">
          <Input
            name="message"
            placeholder="Type a message..."
            className="flex-1"
            disabled={!hasJoined}
          />
          <Button type="submit" size="icon" disabled={!hasJoined}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  };

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        {/* Battle Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(battle.status)}>
              {battle.status}
            </Badge>
            <Badge variant="outline">{battle.type}</Badge>
            <Badge variant="outline">{battle.difficulty}</Badge>
            <Badge variant="outline">{battle.length}</Badge>
          </div>

          <h1 className="text-3xl font-bold">{battle.title}</h1>
          <p className="text-muted-foreground">{battle.description}</p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={battle.user.avatar_url}
                  alt={battle.user.username}
                />
                <AvatarFallback>
                  {battle.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Created by {battle.user.username}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(battle.startDate)} at {formatTime(battle.startDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {battle.currentParticipants}/{battle.maxParticipants}{' '}
                participants
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{battle.topic.title}</span>
            </div>
          </div>
        </div>

        {/* Battle Progress */}
        {battle.status === 'IN_PROGRESS' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Battle Progress</span>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / questions.length) * 100}
            />
          </div>
        )}

        {/* Join Button */}
        {!hasJoined && battle.status === 'UPCOMING' && (
          <Button size="lg" onClick={handleJoinBattle} className="w-full">
            <Swords className="mr-2 h-5 w-5" />
            Join Battle
          </Button>
        )}

        {/* Battle Content */}
        <Tabs defaultValue="questions">
          <TabsList className="w-full">
            <TabsTrigger value="questions" className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              <Info className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6">
            {renderCurrentQuestion()}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            {renderLeaderboard()}
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            {renderChat()}
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <BattleInformation battle={battle} />
                <ParticipantList
                  battleId={battleId}
                  maxParticipants={battle.maxParticipants}
                  showRank={battle.status !== 'UPCOMING'}
                />
              </div>

              <div className="space-y-6">
                <QuestionPreview
                  questions={questions}
                  totalQuestions={battle.total_questions}
                  timePerQuestion={battle.time_per_question}
                  pointsPerQuestion={battle.points_per_question}
                  isPreview={true}
                />
                <BattleRules battle={battle} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </BattleZoneLayout>
  );
}
