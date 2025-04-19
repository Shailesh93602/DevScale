import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useBattleWebSocket } from '@/hooks/useBattleWebSocket';
import { toast } from 'react-toastify';

interface ReadyStatusButtonProps {
  battleId: string;
  userId: string;
  isCreator?: boolean;
  disabled?: boolean;
  onStatusChange?: (isReady: boolean) => void;
}

const ReadyStatusButton: React.FC<ReadyStatusButtonProps> = ({
  battleId,
  userId,
  isCreator = false,
  disabled = false,
  onStatusChange,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, sendToBattle } = useBattleWebSocket(
    'battle:participant_ready',
    battleId,
    (data) => {
      // Handle ready status updates from other participants
      if (data.user_id === userId) {
        setIsReady(!!data.is_ready);
        setIsLoading(false);

        if (onStatusChange) {
          onStatusChange(!!data.is_ready);
        }
      }
    },
  );

  // Toggle ready status
  const toggleReadyStatus = () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // Send ready status update to server
      sendToBattle('battle:participant_ready', {
        user_id: userId,
        is_ready: !isReady,
        status: !isReady ? 'joined' : 'left',
        username: '',
        avatar_url: '',
        battle_id: battleId,
      });

      // Optimistically update local state
      setIsReady(!isReady);

      if (onStatusChange) {
        onStatusChange(!isReady);
      }
    } catch (error) {
      console.error('Failed to update ready status:', error);
      toast.error('Failed to update ready status. Please try again.');
      setIsLoading(false);
    }
  };

  // Force ready status for creator
  useEffect(() => {
    if (isCreator && isConnected && !isReady) {
      setIsReady(true);

      if (onStatusChange) {
        onStatusChange(true);
      }

      sendToBattle('battle:participant_ready', {
        user_id: userId,
        is_ready: true,
        status: 'joined',
        username: '',
        avatar_url: '',
        battle_id: battleId,
      });
    }
  }, [isCreator, isConnected, isReady, userId, sendToBattle, onStatusChange]);

  // Render different button states
  if (isCreator) {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      >
        <CheckCircle className="mr-1 h-3 w-3" />
        Creator (Ready)
      </Badge>
    );
  }

  return (
    <Button
      variant={isReady ? 'default' : 'outline'}
      size="sm"
      className={`gap-2 ${
        isReady
          ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
          : 'border-dashed'
      }`}
      onClick={toggleReadyStatus}
      disabled={disabled || isLoading || !isConnected}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating...</span>
        </>
      ) : isReady ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Ready</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>Not Ready</span>
        </>
      )}
    </Button>
  );
};

export default ReadyStatusButton;
