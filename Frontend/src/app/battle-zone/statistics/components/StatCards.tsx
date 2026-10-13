import type { ReactNode } from 'react';
import { Award, Clock, Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatPercent,
  winRateSummary,
  type BattleStatistics,
} from '../normalize';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  testId?: string;
}

function StatCard({ title, value, description, icon, testId }: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid="stat-card-value">
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function KeyStats({ statistics }: { statistics: BattleStatistics }) {
  const winRate = winRateSummary(statistics);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        testId="stat-card-win-rate"
        title="Win Rate"
        value={winRate.value}
        description={winRate.description}
        icon={<Trophy className="h-5 w-5 text-primary" />}
      />

      <StatCard
        testId="stat-card-accuracy"
        title="Accuracy"
        value={formatPercent(statistics.accuracyPercent)}
        description={`${statistics.correctAnswers} of ${statistics.questionsAnswered} questions`}
        icon={<Target className="h-5 w-5 text-primary" />}
      />

      <StatCard
        testId="stat-card-average-score"
        title="Average Score"
        value={statistics.averageScore.toString()}
        description={`${statistics.totalPoints} total points earned`}
        icon={<Award className="h-5 w-5 text-primary" />}
      />

      <StatCard
        testId="stat-card-response-time"
        title="Response Time"
        value={`${statistics.averageTimeSeconds}s`}
        description="Average time per question"
        icon={<Clock className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}
