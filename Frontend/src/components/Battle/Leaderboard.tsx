'use client';

import React, { useState, useEffect } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowUpDown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  averageTime: number;
  lastActive: string;
}

interface LeaderboardFilters {
  search: string;
  sortBy: 'score' | 'accuracy' | 'averageTime';
  sortOrder: 'asc' | 'desc';
  timeRange: 'all' | 'daily' | 'weekly' | 'monthly';
  page: number;
  limit: number;
}

interface LeaderboardProps {
  battleId?: string;
  isRealTime?: boolean;
  initialFilters?: Partial<LeaderboardFilters>;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  battleId,
  isRealTime = false,
  initialFilters,
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<LeaderboardFilters>({
    search: '',
    sortBy: 'score',
    sortOrder: 'desc',
    timeRange: 'all',
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const [fetchLeaderboard, state] = useAxiosGet<LeaderboardResponse>(
    battleId ? `/api/battles/${battleId}/leaderboard` : '/api/leaderboard',
  );

  // Real-time updates
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        await fetchLeaderboard({ params: filters });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load leaderboard. Please try again.';
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    };

    loadLeaderboard();

    // Set up real-time updates if enabled
    if (isRealTime) {
      const interval = setInterval(loadLeaderboard, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [filters, fetchLeaderboard, isRealTime, toast]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleSort = (field: LeaderboardFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handleTimeRangeChange = (value: LeaderboardFilters['timeRange']) => {
    setFilters((prev) => ({ ...prev, timeRange: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search players..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="daily">Today</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-1"
                >
                  Score
                  <ArrowUpDown
                    className={cn(
                      'h-4 w-4',
                      filters.sortBy === 'score' &&
                        filters.sortOrder === 'asc' &&
                        'rotate-180',
                    )}
                  />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('accuracy')}
                  className="flex items-center gap-1"
                >
                  Accuracy
                  <ArrowUpDown
                    className={cn(
                      'h-4 w-4',
                      filters.sortBy === 'accuracy' &&
                        filters.sortOrder === 'asc' &&
                        'rotate-180',
                    )}
                  />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('averageTime')}
                  className="flex items-center gap-1"
                >
                  Avg. Time
                  <ArrowUpDown
                    className={cn(
                      'h-4 w-4',
                      filters.sortBy === 'averageTime' &&
                        filters.sortOrder === 'asc' &&
                        'rotate-180',
                    )}
                  />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : state.isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-destructive"
                >
                  Failed to load leaderboard
                </TableCell>
              </TableRow>
            ) : state.data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              state.data?.data.map((entry) => (
                <TableRow key={entry.userId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && (
                        <Medal
                          className={cn(
                            'h-5 w-5',
                            entry.rank === 1
                              ? 'text-yellow-500'
                              : entry.rank === 2
                                ? 'text-gray-400'
                                : 'text-amber-600',
                          )}
                        />
                      )}
                      {entry.rank}
                    </div>
                  </TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{entry.score}</TableCell>
                  <TableCell>{Math.round(entry.accuracy * 100)}%</TableCell>
                  <TableCell>{entry.averageTime.toFixed(1)}s</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {state.data && state.data.total > filters.limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page * filters.limit >= state.data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
