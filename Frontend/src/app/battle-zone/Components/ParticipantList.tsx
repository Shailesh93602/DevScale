import React from 'react';
import { useBattleParticipants } from '@/hooks/useBattleWebSocket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Trophy, Medal } from 'lucide-react';

interface ParticipantFromApi {
  user_id: string;
  username: string;
  avatar_url?: string;
  score?: number;
  rank?: number;
  joined_at?: string;
}

interface ParticipantListProps {
  battleId: string;
  maxParticipants: number;
  /** API participants to seed the list; WebSocket join events will augment it */
  apiParticipants?: ParticipantFromApi[];
  showRank?: boolean;
  isLoading?: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  battleId,
  maxParticipants,
  apiParticipants = [],
  showRank = false,
  isLoading = false,
}) => {
  const wsParticipants = useBattleParticipants(battleId);

  // Merge API participants with live WebSocket join events using useMemo instead of state to avoid infinite rendering loop
  const mergedParticipants = React.useMemo(() => {
    // Start with API participants as the base
    const apiMap = new Map<string, ParticipantFromApi>(
      apiParticipants.map((p) => [p.user_id, p]),
    );

    // Overlay WebSocket participants (new joins since page load)
    wsParticipants.forEach((p) => {
      if (!apiMap.has(p.user_id)) {
        apiMap.set(p.user_id, {
          user_id: p.user_id,
          username: p.username,
          avatar_url: p.avatar_url ?? undefined,
          score: 0,
        });
      }
    });

    return Array.from(apiMap.values());
  }, [apiParticipants, wsParticipants]);

  // Sort participants
  const sortedParticipants = React.useMemo(() => {
    if (showRank) {
      return [...mergedParticipants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return mergedParticipants;
  }, [mergedParticipants, showRank]);

  // Get rank badge
  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500 h-4 w-4" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Medal className="h-4 w-4 text-amber-700" />;
    return (
      <span className="flex h-5 w-5 items-center justify-center text-xs font-medium text-muted-foreground">
        {index + 1}
      </span>
    );
  };

  // Empty slots fill up remaining capacity
  const emptySlots = Math.max(0, maxParticipants - sortedParticipants.length);
  const emptySlotArray = Array.from({ length: Math.min(emptySlots, 5) }, (_, i) => i);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Participants</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Participants</span>
            </div>
          </CardTitle>
          <Badge variant="outline">
            {sortedParticipants.length}/{maxParticipants}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sortedParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="mb-2 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No participants yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Be the first to join!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[260px] pr-4">
            <div className="space-y-2">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.user_id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-3">
                    {showRank && (
                      <div className="flex w-5 items-center justify-center">
                        {getRankBadge(index)}
                      </div>
                    )}
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={participant.avatar_url}
                        alt={participant.username}
                      />
                      <AvatarFallback className="text-xs">
                        {participant.username?.charAt(0)?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{participant.username}</p>
                      {showRank && (
                        <p className="text-xs text-muted-foreground">
                          {participant.score ?? 0} pts
                        </p>
                      )}
                    </div>
                  </div>

                  {showRank ? (
                    <Badge variant="outline" className="text-xs">
                      Rank #{index + 1}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs border-green-500/20">
                      Joined
                    </Badge>
                  )}
                </div>
              ))}

              {/* Empty slots */}
              {emptySlotArray.length > 0 && (
                <>
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {emptySlots} slot{emptySlots === 1 ? '' : 's'} available
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {emptySlotArray.map((i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center justify-between rounded-md border border-dashed p-2 opacity-40"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Badge variant="outline" className="opacity-50 text-xs">
                        Open
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantList;
