import React from 'react';
import { useBattleParticipants } from '@/hooks/useBattleWebSocket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Trophy, Medal } from 'lucide-react';

interface ParticipantListProps {
  battleId: string;
  maxParticipants: number;
  showRank?: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  battleId,
  maxParticipants,
  showRank = false,
}) => {
  const participants = useBattleParticipants(battleId);

  // Sort participants by rank if showRank is true
  const sortedParticipants = React.useMemo(() => {
    if (showRank) {
      return [...participants].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
      });
    }
    return participants;
  }, [participants, showRank]);

  // Get rank badge color
  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Medal className="h-4 w-4 text-amber-700" />;
    return null;
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
          >
            Inactive
          </Badge>
        );
      case 'joined':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            Joined
          </Badge>
        );
      case 'left':
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            Left
          </Badge>
        );
      default:
        return null;
    }
  };

  // Generate empty slots
  const emptySlots = Math.max(0, maxParticipants - participants.length);
  const emptySlotArray = Array.from({ length: emptySlots }, (_, i) => i);

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
            {participants.length}/{maxParticipants}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="mb-2 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No participants yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-2">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.user_id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-3">
                    {showRank && getRankBadge(index)}
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={participant.avatar_url}
                        alt={participant.username}
                      />
                      <AvatarFallback>
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {participant.username}
                      </p>
                      {showRank && (
                        <p className="text-xs text-muted-foreground">
                          Rank: #{index + 1}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(participant.status)}
                </div>
              ))}

              {/* Empty slots */}
              {emptySlots > 0 && (
                <>
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-xs text-muted-foreground">
                      Available Slots
                    </span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>

                  {emptySlotArray.map((i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex items-center justify-between rounded-md border border-dashed p-2 opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Badge variant="outline" className="opacity-30">
                        Available
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
