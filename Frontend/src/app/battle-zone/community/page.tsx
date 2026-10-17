'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Button } from '@/components/ui/button';

// No backend exists for a community feed or member list (`/users` and `/forums/posts` both 404),
// so this says so instead of rendering invented members, events and comments.
export default function CommunityPage() {
  return (
    <BattleZoneLayout>
      <div className="mx-auto max-w-xl rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Community is not built yet</h1>
        <p className="mb-6 text-muted-foreground">
          There is no community feed or member directory yet. Battles and the
          leaderboard are where other players show up today.
        </p>
        <Button asChild>
          <Link href="/battle-zone/leaderboard">See the leaderboard</Link>
        </Button>
      </div>
    </BattleZoneLayout>
  );
}
