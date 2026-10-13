import { LineChart as LineChartIcon } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPercent, type BattleStatistics } from '../normalize';

export const NO_TOPIC_DATA = 'No topic data yet — complete some battles first.';

export function EmptyNote({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <p
      className={`py-4 text-center text-sm text-muted-foreground ${className}`.trim()}
    >
      {children}
    </p>
  );
}

function PerformanceOverTimeCard({
  data,
}: {
  data: BattleStatistics['performanceOverTime'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
        <CardDescription>
          Your average score and win rate, week by week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full sm:h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Score"
                />
                <Line
                  type="monotone"
                  dataKey="winRatePercent"
                  stroke="hsl(var(--secondary-foreground))"
                  strokeWidth={2}
                  dot={false}
                  name="Win rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center text-center">
                <LineChartIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No performance data available yet
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceByTopicCard({
  topics,
}: {
  topics: BattleStatistics['performanceByTopic'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Topic</CardTitle>
        <CardDescription>Your strengths and weaknesses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.length === 0 && <EmptyNote>{NO_TOPIC_DATA}</EmptyNote>}
          {topics.map((topic) => (
            <div key={topic.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{topic.label}</span>
                <span className="text-sm text-muted-foreground">
                  {formatPercent(topic.winRatePercent)} won · {topic.battles}{' '}
                  battles
                </span>
              </div>
              <Progress
                value={topic.winRatePercent ?? 0}
                className="h-2"
                aria-label={`${topic.label} win rate`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceCharts({
  statistics,
}: {
  statistics: BattleStatistics;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PerformanceOverTimeCard data={statistics.performanceOverTime} />
      <PerformanceByTopicCard topics={statistics.performanceByTopic} />
    </div>
  );
}
