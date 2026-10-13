import { useEffect, useMemo, useState } from 'react';
import { formatDistance } from 'date-fns';
import type { Battle } from '@/types/battle';

const ONE_HOUR_MS = 3600000;

/** "Starts in…" / "live" / "ended" label, refreshed every minute while a battle is upcoming. */
export function useBattleTimeLabel(battle: Battle) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (battle.status === 'WAITING' || battle.status === 'LOBBY') {
      const interval = setInterval(() => setNow(Date.now()), 60000);
      return () => clearInterval(interval);
    }
  }, [battle.status]);

  return useMemo(() => {
    if (battle.status === 'IN_PROGRESS') {
      return { text: 'Battle is live now', color: 'text-success' };
    }
    if (
      (battle.status === 'WAITING' || battle.status === 'LOBBY') &&
      battle.start_time
    ) {
      const start = new Date(battle.start_time);
      const diffMs = start.getTime() - now;
      const isUrgent = diffMs > 0 && diffMs < ONE_HOUR_MS;
      return {
        text: `Starts ${formatDistance(start, now, { addSuffix: true })}`,
        color: isUrgent ? 'text-warning' : 'text-muted-foreground',
      };
    }
    if (battle.status === 'COMPLETED') {
      return { text: 'Battle ended', color: 'text-muted-foreground' };
    }
    return null;
  }, [battle.status, battle.start_time, now]);
}
