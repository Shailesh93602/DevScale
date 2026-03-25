import { useEffect, useState } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import { Battle, BattleFilters, BattleResponse } from '@/types/battle';
import { BattleFilters as BattleFiltersComponent } from './BattleFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const defaultFilters: BattleFilters = {
  search: '',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

export const BattleList = () => {
  const [filters, setFilters] = useState<BattleFilters>(defaultFilters);
  const [execute, state] = useAxiosGet<BattleResponse>('/api/battles');
  const { toast } = useToast();

  useEffect(() => {
    execute({ params: filters });
  }, [execute, filters]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch battles. Please try again.',
      });
    }
  }, [state.error, toast]);

  const handleFilterChange = (key: keyof BattleFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const renderBattleCard = (battle: Battle) => (
    <Card key={battle.id} className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{battle.title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {formatDistanceToNow(new Date(battle.createdAt), {
              addSuffix: true,
            })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {battle.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>
              {battle.currentParticipants}/{battle.maxParticipants} participants
            </span>
            <span>Prize: ${battle.prize}</span>
          </div>
          <Button variant="outline" size="sm">
            Join Battle
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (state.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">Failed to load battles</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => execute({ params: filters })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const { data, meta } = state.data || {
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  };

  return (
    <div className="space-y-6">
      <BattleFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {data.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No battles found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">{data.map(renderBattleCard)}</div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {data.length} of {meta.total} battles
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => handlePageChange(meta.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
