'use client';

import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Separator } from '@/components/ui/separator';
import { useBattleDetail } from './hooks/useBattleDetail';
import { BattleHeader, BattleTabs } from './components/BattleHeader';
import {
  BattleCancelledPanel,
  BattleDetailSkeleton,
  BattleNotFound,
  SpectatorPanel,
} from './components/BattleStatusPanels';
import { WaitingPhase } from './components/WaitingPhase';
import { LobbyPhase } from './components/LobbyPhase';
import { QuestionPhase } from './components/QuestionPhase';
import { CompletedPhase } from './components/CompletedPhase';
import { LeaderboardTab } from './components/LeaderboardTab';
import type { LoadedBattleState } from './components/shared';

function BattleBody({ s }: { s: LoadedBattleState }) {
  const { battle, activeTab } = s;
  const browse = () => s.router.push('/battle-zone');
  const leaderboardTab = (
    <LeaderboardTab leaderboard={s.leaderboard} userId={s.userId} />
  );

  switch (battle.status) {
    case 'WAITING':
      return <WaitingPhase s={s} />;
    case 'LOBBY':
      return <LobbyPhase s={s} />;
    case 'CANCELLED':
      return <BattleCancelledPanel onBrowse={browse} />;
    case 'IN_PROGRESS':
      if (activeTab === 'leaderboard') return leaderboardTab;
      return s.isParticipant ? <QuestionPhase s={s} /> : <SpectatorPanel />;
    case 'COMPLETED':
      return activeTab === 'battle' ? <CompletedPhase s={s} /> : leaderboardTab;
    default:
      return null;
  }
}

export default function BattleDetailPage() {
  const s = useBattleDetail();

  if (s.loading) return <BattleDetailSkeleton />;
  if (!s.battle) {
    return <BattleNotFound onBrowse={() => s.router.push('/battle-zone')} />;
  }

  const loaded = s as LoadedBattleState;
  const { battle } = loaded;
  const isBattlePhase =
    battle.status === 'IN_PROGRESS' || battle.status === 'COMPLETED';

  return (
    <BattleZoneLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <BattleHeader battle={battle} isConnected={s.isConnected} />

        <Separator />

        {/* Tab bar (only for in-progress / completed) */}
        {isBattlePhase && (
          <BattleTabs
            activeTab={s.activeTab}
            onChange={s.setActiveTab}
            completed={battle.status === 'COMPLETED'}
            leaderboardCount={s.leaderboard.length}
          />
        )}

        <BattleBody s={loaded} />
      </div>
    </BattleZoneLayout>
  );
}
