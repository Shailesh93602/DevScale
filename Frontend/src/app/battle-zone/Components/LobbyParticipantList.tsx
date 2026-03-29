import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/contexts/WebSocketContext';
import Image from 'next/image';

interface LobbyParticipantListProps {
  battleId: string;
  maxParticipants: number;
  currentUserId: string;
  creatorId: string;
  onAllReady: (isReady: boolean) => void;
}

interface Participant {
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'joined' | 'left' | 'active' | 'inactive';
  is_ready?: boolean;
}

const LobbyParticipantList: React.FC<LobbyParticipantListProps> = ({
  battleId,
  maxParticipants,
  currentUserId,
  creatorId,
  onAllReady,
}) => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const { send, addEventListener } = useWebSocket();

  // Listen for participant join events
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    send({
      type: 'battle:join',
      data: { battleId },
    });
    // Simulate loading time for initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [battleId, send]);

  // Listen for participant leave events
  useEffect(() => {
    const unsubscribe = addEventListener('battle:leave', (data) => {
      const eventData = data as { battleId: string; participantId: string };
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(eventData.participantId);
        return newMap;
      });
    });
    return () => unsubscribe();
  }, [addEventListener]);

  // Listen for participant ready events
  useEffect(() => {
    const unsubscribe = addEventListener('battle:ready', (data) => {
      const eventData = data as {
        battleId: string;
        participantId: string;
        isReady: boolean;
      };
      setParticipants((prev) => {
        const newMap = new Map(prev);
        const participant = newMap.get(eventData.participantId);
        if (participant) {
          newMap.set(eventData.participantId, {
            ...participant,
            is_ready: eventData.isReady,
          });
        }
        return newMap;
      });
    });
    return () => unsubscribe();
  }, [addEventListener]);

  // Check if all participants are ready
  useEffect(() => {
    const allReady = Array.from(participants.values()).every(
      (p) => p.is_ready || p.user_id === creatorId,
    );
    onAllReady(allReady);
  }, [participants, creatorId, onAllReady]);

  // Toggle ready status
  const toggleReady = () => {
    const participant = participants.get(currentUserId);
    if (!participant) return;

    const newStatus = !participant.is_ready;
    send({
      type: 'battle:ready',
      data: {
        battleId,
        participantId: currentUserId,
        isReady: newStatus,
      },
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {participants.size} / {maxParticipants} participants
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {Array.from(participants.values()).map((participant) => (
          <motion.div
            key={participant.user_id}
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateX: -100 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                'p-4 transition-colors',
                participant.is_ready && 'bg-muted/50',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {participant.avatar_url ? (
                    <Image
                      src={participant.avatar_url}
                      alt={participant.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {participant.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {participant.username}
                      {participant.user_id === creatorId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Creator)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.is_ready ? 'Ready' : 'Not ready'}
                    </p>
                  </div>
                </div>

                {participant.user_id === currentUserId ? (
                  <Button
                    variant={participant.is_ready ? 'outline' : 'default'}
                    size="sm"
                    onClick={toggleReady}
                    className="min-w-[100px]"
                  >
                    {participant.is_ready ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Not Ready
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Ready
                      </>
                    )}
                  </Button>
                ) : (
                  <div
                    className={cn(
                      'flex h-8 items-center rounded-md px-3 text-sm',
                      participant.is_ready
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500',
                    )}
                  >
                    {participant.is_ready ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Waiting
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {participants.size === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No participants yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Share the battle link to invite others!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LobbyParticipantList;
