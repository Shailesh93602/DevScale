'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Download } from 'lucide-react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  normalizeBattleStatistics,
  type BattleStatistics,
  type RawBattleStatistics,
} from './normalize';
import { KeyStats } from './components/StatCards';
import { PerformanceCharts } from './components/PerformanceCards';
import { DifficultyCard, HistoryCards } from './components/HistoryCards';

const TIMEFRAMES = [
  { value: 'all-time', label: 'All Time' },
  { value: 'this-year', label: 'This Year' },
  { value: 'this-month', label: 'This Month' },
  { value: 'this-week', label: 'This Week' },
];

function useBattleStatistics(timeframe: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<BattleStatistics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [getStatistics] = useAxiosGet<RawBattleStatistics>(
    '/battles/statistics/me',
  );

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await getStatistics({ params: { timeframe } });
        if (response.success && response.data?.stats) {
          // One payload, one reader — see ./normalize.ts.
          setStatistics(normalizeBattleStatistics(response.data));
        } else {
          setStatistics(null);
          setErrorMessage(response.message || 'Unable to load statistics.');
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setStatistics(null);
        setErrorMessage('Failed to fetch statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [timeframe]);

  return { isLoading, statistics, errorMessage };
}

function StatisticsSkeleton() {
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

function StatisticsUnavailable({ message }: { message: string | null }) {
  return (
    <BattleZoneLayout>
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Statistics unavailable</h2>
        <p className="mt-2 text-muted-foreground">
          {message || 'No statistics available yet.'}
        </p>
      </div>
    </BattleZoneLayout>
  );
}

export default function StatisticsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('all-time');
  const { isLoading, statistics, errorMessage } =
    useBattleStatistics(timeframe);

  if (isLoading) return <StatisticsSkeleton />;
  if (errorMessage || !statistics) {
    return <StatisticsUnavailable message={errorMessage} />;
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
                {TIMEFRAMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              disabled
              title="Export coming soon"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <KeyStats statistics={statistics} />
        <PerformanceCharts statistics={statistics} />
        <HistoryCards
          statistics={statistics}
          onNavigate={(path) => router.push(path)}
        />
        <DifficultyCard levels={statistics.performanceByDifficulty} />
      </div>
    </BattleZoneLayout>
  );
}
