import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useBattleApi from '@/hooks/useBattleApi';

interface ReadyStatusButtonProps {
  battleId: string;
  isCreator?: boolean;
  disabled?: boolean;
  onStatusChange?: (isReady: boolean) => void;
}

const ReadyStatusButton: React.FC<ReadyStatusButtonProps> = ({
  battleId,
  isCreator = false,
  disabled = false,
  onStatusChange,
}) => {
  const { toast } = useToast();
  const { markReady } = useBattleApi();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkReady = async () => {
    if (disabled || isLoading || isReady) return;

    setIsLoading(true);
    try {
      await markReady(battleId);
      setIsReady(true);
      if (onStatusChange) onStatusChange(true);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update ready status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreator) {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-600 border-green-500/20"
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
        isReady ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-dashed'
      }`}
      onClick={handleMarkReady}
      disabled={disabled || isLoading || isReady}
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
          <span>Mark Ready</span>
        </>
      )}
    </Button>
  );
};

export default ReadyStatusButton;
