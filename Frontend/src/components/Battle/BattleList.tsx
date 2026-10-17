'use client';

import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useAxiosGet } from '@/hooks/useAxios';
import { useBattleStore } from '@/store/battleStore';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Battle, BattleFilters, BattleStatus } from '@/types/battle';
import { Button } from '@/components/ui/button';
import { normalizeBattle } from '@/lib/battle-normalizer';

// Lazy load components
const BattleCard = lazy(() => import('./BattleCard'));
import { BattleCardSkeleton } from './BattleCard';

const SKELETON_COUNT = 6;
const skeletonIds = Array.from(
  { length: SKELETON_COUNT },
  (_, i) => `battle-skeleton-${i}`,
);

interface BattleListProps {
  initialFilters?: BattleFilters;
  onJoinBattle?: (battleId: string) => Promise<unknown>;
  /** `mine` reads `/battles/my` (created or joined by the caller); `select` then narrows that page. */
  scope?: 'all' | 'mine';
  select?: (battle: Battle) => boolean;
}

type ListMeta = { page: number; lastPage: number } | null;

const readMeta = (meta: Record<string, unknown> | undefined): ListMeta => {
  const p = meta?.pagination as
    | { currentPage?: number; lastPage?: number }
    | undefined;
  const page = Number(p?.currentPage ?? meta?.page);
  const lastPage = Number(p?.lastPage ?? meta?.totalPages);
  return Number.isFinite(page) && Number.isFinite(lastPage)
    ? { page, lastPage }
    : null;
};

export const BattleList: React.FC<BattleListProps> = ({
  initialFilters,
  onJoinBattle,
  scope = 'all',
  select,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { filters, setFilters, resetFilters } = useBattleStore();
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const appliedInitialFiltersRef = useRef<string | null>(null);
  const initialFiltersKey = useMemo(
    () => JSON.stringify(initialFilters ?? {}),
    [initialFilters],
  );

  const [executeAll] = useAxiosGet<Battle[]>('/battles');
  const [executeMine] = useAxiosGet<Battle[]>('/battles/my');
  const [battles, setBattles] = useState<Battle[] | null>(null);
  const [meta, setMeta] = useState<ListMeta>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    if (
      initialFilters &&
      appliedInitialFiltersRef.current !== initialFiltersKey
    ) {
      appliedInitialFiltersRef.current = initialFiltersKey;
      // The store merges, so replace: a tab's keys must not leak into the next tab.
      resetFilters();
      setFilters(initialFilters);
    }
  }, [initialFilters, initialFiltersKey, setFilters, resetFilters]);

  // The store is global; without this, My Battles' filters followed the user to /battle-zone.
  useEffect(
    () => () => {
      appliedInitialFiltersRef.current = null; // StrictMode remounts must re-apply them
      resetFilters();
    },
    [resetFilters],
  );

  const fetchBattles = async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    const sanitizedFilters = Object.fromEntries(
      Object.entries({
        ...filters,
        search: searchTerm,
      }).filter(([, value]) => value !== '' && value !== 'all'),
    );
    const res =
      scope === 'mine'
        ? await executeMine({
            params: { page: filters.page ?? 1, limit: filters.limit ?? 12 },
          })
        : await executeAll({ params: { ...sanitizedFilters } });
    if (requestId !== latestRequest.current) return;
    setIsLoading(false);
    if (!res.success) {
      setLoadError(res.message || 'Failed to fetch battles.');
      toast({
        title: 'Error',
        description: 'Failed to fetch battles. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    setLoadError(null);
    const list = Array.isArray(res.data) ? res.data.map(normalizeBattle) : [];
    setBattles(select ? list.filter(select) : list);
    setMeta(readMeta(res.meta));
  };

  useEffect(() => {
    fetchBattles();
  }, [filters, searchTerm, scope, select]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleStatusChange = (value: BattleStatus | 'all') => {
    setFilters({ ...filters, status: value });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const renderPagination = () => {
    if (!meta) return null;
    const { page, lastPage: totalPages } = meta;
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skeletonIds.map((id) => (
            <BattleCardSkeleton key={id} />
          ))}
        </div>
      );
    }

    if (loadError) {
      return (
        <div
          role="alert"
          className="col-span-full rounded-xl border border-destructive/40 bg-card py-12 text-center"
        >
          <h3 className="mb-2 text-xl font-bold tracking-tight">
            Could not load battles
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => fetchBattles()}>
            Retry
          </Button>
        </div>
      );
    }

    if (battles && battles.length > 0) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {battles.map((battle) => (
              <Suspense key={battle.id} fallback={<BattleCardSkeleton />}>
                <BattleCard
                  battle={battle}
                  onJoin={onJoinBattle}
                  currentUserId={user?.id}
                />
              </Suspense>
            ))}
          </div>
          {renderPagination()}
        </>
      );
    }

    return (
      <div className="col-span-full rounded-xl border border-dashed border-primary/20 bg-card py-16 text-center shadow-inner">
        <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center p-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
              <line x1="13" y1="19" x2="19" y2="13" />
              <line x1="16" y1="16" x2="20" y2="20" />
              <line x1="19" y1="21" x2="21" y2="19" />
              <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
              <line x1="5" y1="14" x2="9" y2="18" />
              <line x1="7" y1="17" x2="4" y2="20" />
              <line x1="3" y1="19" x2="5" y2="21" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold tracking-tight">
            No battles found
          </h3>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            We could not find any battles matching your criteria. Be the first
            to start a new challenge!
          </p>
          <Link href="/battle-zone/create">
            <Button>Create Your First Battle</Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search battles..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger
            className="w-[180px]"
            aria-label="Filter by battle status"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Battles</SelectItem>
            <SelectItem value="WAITING">Waiting</SelectItem>
            <SelectItem value="LOBBY">In Lobby</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {renderContent()}
    </div>
  );
};
