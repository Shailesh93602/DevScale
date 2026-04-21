import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  Target,
  Zap,
  Users,
  Plus,
  Swords,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAxiosGet } from '@/hooks/useAxios';
import { useAuth } from '@/contexts/AuthContext';

interface BattleStatsResponse {
  win_rate?: number;
  wins?: number;
  total_battles?: number;
}

interface BattleGlobalStatsResponse {
  activeBattles: number;
  upcomingBattles: number;
  totalParticipants: number;
}

interface BattleZoneLayoutProps {
  children: ReactNode;
}

const BattleZoneLayout: React.FC<BattleZoneLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, status } = useAuth();
  const [globalStats, setGlobalStats] = useState({
    activeBattles: 0,
    upcomingBattles: 0,
    totalParticipants: 0,
  });
  const [userWinRate, setUserWinRate] = useState<string>('--');
  const [getGlobalStats] = useAxiosGet<BattleGlobalStatsResponse>(
    '/battles/global-stats',
  );
  const [getStatistics] = useAxiosGet<BattleStatsResponse>(
    '/battles/statistics/me',
  );

  useEffect(() => {
    const loadQuickStats = async () => {
      // Single SQL aggregate query — replaces the old ?limit=100 object fetch
      const globalRes = await getGlobalStats();
      if (globalRes.success && globalRes.data) {
        setGlobalStats({
          activeBattles: globalRes.data.activeBattles,
          upcomingBattles: globalRes.data.upcomingBattles,
          totalParticipants: globalRes.data.totalParticipants,
        });
      }

      if (!isAuthenticated) {
        setUserWinRate('--');
        return;
      }

      const statsResponse = await getStatistics();
      if (statsResponse.success && statsResponse.data) {
        const d = statsResponse.data;
        // Use pre-calculated win_rate from backend, fall back to manual calc
        const winRate =
          d.win_rate ??
          (d.wins != null && d.total_battles != null
            ? Math.round((d.wins / Math.max(d.total_battles, 1)) * 100)
            : 0);
        setUserWinRate(`${winRate}%`);
        return;
      }

      setUserWinRate('--');
    };

    if (status !== 'loading') {
      loadQuickStats();
    }
  }, [getGlobalStats, getStatistics, isAuthenticated, status]);

  const quickStats = useMemo(
    () => [
      {
        title: 'Active Battles',
        value: `${globalStats.activeBattles}`,
        icon: <Zap className="text-yellow-500 h-5 w-5" />,
        color: 'text-yellow-500',
      },
      {
        title: 'Upcoming Battles',
        value: `${globalStats.upcomingBattles}`,
        icon: <Clock className="text-blue-500 h-5 w-5" />,
        color: 'text-blue-500',
      },
      {
        title: 'Total Participants',
        value: `${globalStats.totalParticipants}`,
        icon: <Users className="text-green-500 h-5 w-5" />,
        color: 'text-green-500',
      },
      {
        title: 'Win Rate',
        value: userWinRate,
        icon: <Target className="text-purple-500 h-5 w-5" />,
        color: 'text-purple-500',
      },
    ],
    [globalStats, userWinRate],
  );

  // Get breadcrumb segments
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => s !== 'battle-zone');
  const isHomePage = pathname === '/battle-zone';

  return (
    <div className="min-h-screen bg-background">
      {/* Real-time infrastructure status — honest about current state.
          The live Battle Zone depends on the Socket.io server, which at
          time of writing is being migrated from the Vercel serverless
          deploy (no long-lived connections) to a dedicated host. The
          standalone redis-battle-demo is the working reference in the
          meantime. */}
      <div
        role="status"
        className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm text-warning"
      >
        ⚠️ Real-time matchmaking is being migrated to a dedicated WebSocket
        host — some live-battle features may be unavailable. The working
        distributed-lock sibling demo is at{' '}
        <a
          href="https://redis-battle-demo.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2"
        >
          redis-battle-demo
        </a>
        .
      </div>
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2">
              <Link
                href="/battle-zone"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Battle Zone
              </Link>
              {segments.map((segment, index) => (
                <React.Fragment key={segment}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/battle-zone/${segments.slice(0, index + 1).join('/')}`}
                    className={cn(
                      'text-sm font-medium',
                      index === segments.length - 1
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(segment)
                      ? 'Battle'
                      : segment
                          .split('-')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ')}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            {/* Create Battle Button */}
            <Link href="/battle-zone/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Battle
              </Button>
            </Link>
          </div>

          {/* Stats Bar - Only show on non-home pages */}
          {!isHomePage && (
            <div className="mt-4 hidden grid-cols-4 gap-4 lg:grid">
              {quickStats.map((stat) => (
                <div
                  key={stat.title}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                >
                  <div className={cn('rounded-full bg-muted p-2', stat.color)}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {isHomePage && (
            <motion.div
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="border-primary/20 rounded-2xl border bg-card p-10 shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)/0.08) 100%)',
              }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Battle Zone Arena
                  </h2>
                  <p className="mt-3 text-lg text-muted-foreground">
                    Explore active battles, join live competitions, or launch a
                    new challenge.
                  </p>
                </div>
                <Link href="/battle-zone/create" className="shrink-0">
                  <Button
                    size="lg"
                    className="shadow-primary/30 flex items-center gap-2 rounded-xl px-8 shadow-md"
                  >
                    <Swords className="h-5 w-5" />
                    Create Battle
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default BattleZoneLayout;
