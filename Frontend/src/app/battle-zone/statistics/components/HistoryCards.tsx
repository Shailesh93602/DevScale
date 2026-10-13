import { Award, Brain, Percent, Swords, Trophy, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatPercent,
  type BattleOutcome,
  type BattleStatistics,
} from '../normalize';
import { EmptyNote, NO_TOPIC_DATA } from './PerformanceCards';

const OUTCOME_BADGE: Record<
  BattleOutcome,
  { label: string; className: string }
> = {
  win: { label: 'Win', className: 'bg-success/15 text-success' },
  loss: { label: 'Loss', className: 'bg-red/15 text-red' },
  draw: { label: 'Draw', className: 'bg-muted text-muted-foreground' },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
  },
  ongoing: { label: 'Ongoing', className: 'bg-blue/15 text-blue' },
};

const TOP_TOPIC_ICONS = [Trophy, Award];

const DIFFICULTY_STYLE: Record<
  string,
  { className: string; icon: typeof Zap }
> = {
  Easy: { className: 'bg-success/15 text-success', icon: Zap },
  Medium: { className: 'bg-warning/15 text-warning', icon: Swords },
};
const HARD_STYLE = { className: 'bg-red/15 text-red', icon: Brain };

function RecentBattlesCard({
  battles,
  onViewAll,
}: {
  battles: BattleStatistics['recentBattles'];
  onViewAll: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Battles</CardTitle>
        <CardDescription>Your latest battle performances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {battles.length === 0 && (
            <EmptyNote>
              No battles yet. Join your first battle to see history here!
            </EmptyNote>
          )}
          {battles.map((battle) => (
            <div
              key={battle.id}
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
                  {/* No participant count in the payload, so no "Rank 2/0". */}
                  {battle.rank !== null && (
                    <div className="text-sm text-muted-foreground">
                      Rank {battle.rank}
                    </div>
                  )}
                </div>
                <Badge className={OUTCOME_BADGE[battle.outcome].className}>
                  {OUTCOME_BADGE[battle.outcome].label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          View All Battles
        </Button>
      </CardFooter>
    </Card>
  );
}

function TopTopicsCard({
  topics,
  onBrowse,
}: {
  topics: BattleStatistics['topTopics'];
  onBrowse: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Topics</CardTitle>
        <CardDescription>Your best performing topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.length === 0 && <EmptyNote>{NO_TOPIC_DATA}</EmptyNote>}
          {topics.map((topic, index) => {
            const Icon = TOP_TOPIC_ICONS[index] ?? Brain;
            return (
              <div
                key={topic.label}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{topic.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {topic.battles} battles
                  </div>
                </div>
                <div className="text-right font-bold">
                  {topic.averageScore} pts avg
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onBrowse}>
          Browse All Battles
        </Button>
      </CardFooter>
    </Card>
  );
}

export function HistoryCards({
  statistics,
  onNavigate,
}: {
  statistics: BattleStatistics;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RecentBattlesCard
        battles={statistics.recentBattles}
        onViewAll={() => onNavigate('/battle-zone/my')}
      />
      <TopTopicsCard
        topics={statistics.topTopics}
        onBrowse={() => onNavigate('/battle-zone')}
      />
    </div>
  );
}

export function DifficultyCard({
  levels,
}: {
  levels: BattleStatistics['performanceByDifficulty'];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Difficulty</CardTitle>
        <CardDescription>
          How you perform across different difficulty levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          {levels.length === 0 && (
            <EmptyNote className="sm:col-span-3">
              No completed battles yet.
            </EmptyNote>
          )}
          {levels.map((difficulty) => {
            const style = DIFFICULTY_STYLE[difficulty.label] ?? HARD_STYLE;
            const Icon = style.icon;
            return (
              <div
                key={difficulty.label}
                className="rounded-lg border p-6 text-center"
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${style.className}`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-1 text-xl font-bold">{difficulty.label}</h3>
                <p
                  className="mb-4 text-muted-foreground"
                  data-testid="difficulty-battles"
                >
                  {difficulty.battles} battles
                </p>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {formatPercent(difficulty.winRatePercent)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Win rate ({difficulty.wins} won)
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
