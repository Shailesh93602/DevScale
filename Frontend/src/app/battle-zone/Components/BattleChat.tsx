import React, { useEffect, useRef, useState } from 'react';
import { useBattleChat } from '@/hooks/useBattleWebSocket';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface BattleChatProps {
  battleId: string;
  currentUserId: string;
  maxHeight?: string;
}

const BattleChat: React.FC<BattleChatProps> = ({
  battleId,
  currentUserId,
  maxHeight = '400px',
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isConnected } = useBattleChat(battleId);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      sendMessage(message);
      setMessage('');
      setError(null);
    } catch {
      setError('Failed to send message. Please try again.');
    }
  };

  // Loading state
  if (!messages) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connection lost. Reconnecting...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className={cn('flex flex-col', maxHeight && `h-[${maxHeight}]`)}>
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full items-center justify-center"
              >
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={`${msg.user_id}-${msg.timestamp}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex gap-4',
                      msg.user_id === currentUserId && 'flex-row-reverse',
                    )}
                  >
                    {msg.avatar_url ? (
                      <Image
                        src={msg.avatar_url}
                        alt={msg.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {msg.username[0].toUpperCase()}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-lg p-3',
                        msg.user_id === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium">
                          {msg.user_id === currentUserId ? 'You' : msg.username}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t p-4"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BattleChat;
