'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Battle } from '@/types/battle';
import useBattleApi from '@/hooks/useBattleApi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Users,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Swords,
  Timer,
  Brain,
  Target,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function JoinBattlePage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const { fetchBattle, joinExistingBattle, isLoading, error } = useBattleApi();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Load battle details
  useEffect(() => {
    const loadBattle = async () => {
      const response = await fetchBattle(battleId);
      if (response) {
        setBattle(response);
      }
    };

    loadBattle();
  }, [battleId, fetchBattle]);

  // Handle join battle
  const handleJoinBattle = async () => {
    if (!agreedToRules) {
      toast.error('Please agree to the battle rules before joining');
      return;
    }

    setIsJoining(true);
    try {
      const response = await joinExistingBattle(battleId);
      if (response) {
        toast.success('Successfully joined the battle!');
        router.push(`/battle-zone/${battleId}`);
      }
    } catch (error) {
      toast.error('Failed to join battle');
      console.error('Failed to join battle:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // Render loading state
  if (isLoading || !battle) {
    return (
      <BattleZoneLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
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

  // Check if battle is joinable
  const isJoinable =
    battle.status === 'UPCOMING' &&
    battle.currentParticipants < battle.maxParticipants;

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
        return 'bg-blue/10 text-blue';
      case 'IN_PROGRESS':
        return 'bg-green/10 text-green';
      case 'COMPLETED':
        return 'bg-muted text-muted-foreground';
      case 'CANCELLED':
        return 'bg-red/10 text-red';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green/10 text-green';
      case 'medium':
        return 'bg-yellow/10 text-yellow';
      case 'hard':
        return 'bg-red/10 text-red';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <BattleZoneLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Battle Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(battle.status)}>
                  {battle.status}
                </Badge>
                <Badge variant="outline">{battle.type}</Badge>
                <Badge className={getDifficultyColor(battle.difficulty)}>
                  {battle.difficulty}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-2xl">{battle.title}</CardTitle>
              <CardDescription>{battle.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Battle Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(battle.startDate)} at{' '}
                      {formatTime(battle.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {formatTime(battle.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {battle.currentParticipants}/{battle.maxParticipants}{' '}
                      participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Topic: {battle.topic.title}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Battle Settings</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span>{battle.total_questions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {battle.points_per_question} points per question
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{battle.time_per_question} seconds per question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4 text-muted-foreground" />
                    <span>Length: {battle.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={battle.user.avatar_url}
                    alt={battle.user.username}
                  />
                  <AvatarFallback>
                    {battle.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Created by
                  </div>
                  <div className="font-medium">{battle.user.username}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Battle Form */}
          <Card>
            <CardHeader>
              <CardTitle>Join Battle</CardTitle>
              <CardDescription>
                Review the battle details and rules before joining
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isJoinable && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-semibold">Cannot Join Battle</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    {battle.status !== 'UPCOMING'
                      ? 'This battle is no longer accepting participants.'
                      : 'This battle has reached its maximum number of participants.'}
                  </p>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Battle Rules</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 mt-0.5 h-4 w-4" />
                    <span>
                      You must answer questions within the time limit.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 mt-0.5 h-4 w-4" />
                    <span>
                      Points are awarded based on correctness and speed.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 mt-0.5 h-4 w-4" />
                    <span>You can only submit one answer per question.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 mt-0.5 h-4 w-4" />
                    <span>The leaderboard is updated in real-time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="text-red-600 mt-0.5 h-4 w-4" />
                    <span>No cheating or using external resources.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="text-red-600 mt-0.5 h-4 w-4" />
                    <span>No sharing answers with other participants.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">What to Expect</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-0.5 h-4 w-4" />
                    <span>The battle will start at the scheduled time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-0.5 h-4 w-4" />
                    <span>Questions will be presented one at a time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-0.5 h-4 w-4" />
                    <span>
                      You can chat with other participants during the battle.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="text-blue-600 mt-0.5 h-4 w-4" />
                    <span>
                      Results will be available immediately after the battle
                      ends.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="rules"
                  checked={agreedToRules}
                  onCheckedChange={(checked) =>
                    setAgreedToRules(checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="rules"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the battle rules and code of conduct
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleJoinBattle}
                disabled={!isJoinable || isJoining || !agreedToRules}
              >
                {isJoining ? (
                  'Joining...'
                ) : (
                  <>
                    Join Battle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </BattleZoneLayout>
  );
}
