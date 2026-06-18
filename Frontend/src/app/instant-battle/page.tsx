'use client';
import { ComingSoon } from '@/components/ui/coming-soon';

// Instant 1-v-1 matchmaking is not built yet (no waiting-room backend), and this
// route is unlinked. Show an honest Coming Soon instead of the old flow, which
// navigated to /battles/undefined → 404. Create or join a battle from the
// Battle Zone in the meantime.
export default function InstantBattlePage() {
  return (
    <ComingSoon
      title="Instant Battle Coming Soon"
      description="One-tap matchmaking that drops you straight into a live 1-v-1 is on the way. For now, head to the Battle Zone to create a battle or join an open one."
    />
  );
}
