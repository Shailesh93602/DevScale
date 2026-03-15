'use client';

import { useState, useEffect } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Trophy,
  Clock,
  Award,
  Download,
  Swords,
  Brain,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';

interface StatisticsData {
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  winRate: number;
  totalPoints: number;
  averageScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  topTopics: {
    topic: string;
    score: number;
    battles: number;
  }[];
  recentBattles: {
    id: string;
    title: string;
    date: string;
    result: 'win' | 'loss' | 'ongoing';
    score: number;
    rank: number;
    totalParticipants: number;
  }[];
  performanceByDifficulty: {
    difficulty: string;
    accuracy: number;
    battles: number;
  }[];
  performanceByTopic: {
    topic: string;
    accuracy: number;
    battles: number;
  }[];
  performanceOverTime: {
    date: string;
    score: number;
    accuracy: number;
  }[];
}

export default function StatisticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [timeframe, setTimeframe] = useState('all-time');

  const [getStatistics] = useAxiosGet<StatisticsData>('/api/statistics');

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would pass the timeframe as a query param
        const response = await getStatistics();
        if (response.data) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [timeframe]);

  // Render loading state
  if (isLoading || !statistics) {
    return (
      <BattleZoneLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Battle Statistics</h1>
            <p className="text-muted-foreground">
              Track your performance and progress in battles
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Win Rate"
            value={`${statistics.winRate}%`}
            description={`${statistics.battlesWon} of ${statistics.totalBattles} battles`}
            icon={<Trophy className="h-5 w-5 text-primary" />}
            trend={{
              value: 5.2,
              direction: 'up',
            }}
          />

          <StatCard
            title="Accuracy"
            value={`${statistics.accuracy}%`}
            description={`${statistics.correctAnswers} of ${statistics.questionsAnswered} questions`}
            icon={<Target className="h-5 w-5 text-primary" />}
            trend={{
              value: 2.1,
              direction: 'up',
            }}
          />

          <StatCard
            title="Average Score"
            value={statistics.averageScore.toString()}
            description={`${statistics.totalPoints} total points earned`}
            icon={<Award className="h-5 w-5 text-primary" />}
            trend={{
              value: 1.8,
              direction: 'down',
            }}
          />

          <StatCard
            title="Response Time"
            value={`${statistics.averageTime}s`}
            description="Average time per question"
            icon={<Clock className="h-5 w-5 text-primary" />}
            trend={{
              value: 0.5,
              direction: 'down',
            }}
          />
        </div>

        {/* Performance Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Your battle scores and accuracy trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {/* This would be a real chart in a production app */}
                <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center text-center">
                    <LineChart className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Performance chart would be rendered here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>Your strengths and weaknesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.performanceByTopic.map((topic, index) => (
                  <div key={index}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{topic.topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {topic.accuracy}%
                      </span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Battles and Top Topics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Battles</CardTitle>
              <CardDescription>Your latest battle performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.recentBattles.map((battle, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <div className="font-medium">{battle.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {battle.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{battle.score} pts</div>
                        <div className="text-sm text-muted-foreground">
                          Rank {battle.rank}/{battle.totalParticipants}
                        </div>
                      </div>
                      <Badge
                        className={
                          battle.result === 'win'
                            ? 'bg-green/10 text-green'
                            : battle.result === 'loss'
                              ? 'bg-red/10 text-red'
                              : 'bg-blue/10 text-blue'
                        }
                      >
                        {battle.result === 'win'
                          ? 'Win'
                          : battle.result === 'loss'
                            ? 'Loss'
                            : 'Ongoing'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Battles
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
              <CardDescription>Your best performing topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.topTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                      {index === 0 ? (
                        <Trophy className="h-5 w-5" />
                      ) : index === 1 ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        <Brain className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{topic.topic}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.battles} battles
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      {topic.score} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Topics
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Performance by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Difficulty</CardTitle>
            <CardDescription>
              How you perform across different difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {statistics.performanceByDifficulty.map((difficulty, index) => (
                <div key={index} className="rounded-lg border p-6 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      difficulty.difficulty === 'Easy'
                        ? 'bg-green/10 text-green'
                        : difficulty.difficulty === 'Medium'
                          ? 'bg-yellow/10 text-yellow'
                          : 'bg-red/10 text-red'
                    }`}
                  >
                    {difficulty.difficulty === 'Easy' ? (
                      <Zap className="h-8 w-8" />
                    ) : difficulty.difficulty === 'Medium' ? (
                      <Swords className="h-8 w-8" />
                    ) : (
                      <Brain className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="mb-1 text-xl font-bold">
                    {difficulty.difficulty}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {difficulty.battles} battles
                  </p>
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {difficulty.accuracy}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy rate</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BattleZoneLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div
            className={`mt-2 flex items-center text-xs ${
              trend.direction === 'up' ? 'text-green' : 'text-red'
            }`}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            <span>{trend.value}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
