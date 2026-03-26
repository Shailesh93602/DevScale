import React, { useEffect, useRef, useState } from 'react';
import { useBattleChat } from '@/hooks/useBattleWebSocket';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Send, AlertCircle, MessageSquare, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleChatProps {
  battleId: string;
  currentUserId: string;
  /** Height of the chat area in CSS units, e.g. '400px' or '60vh' */
  maxHeight?: string;
}

const BattleChat: React.FC<BattleChatProps> = ({
  battleId,
  currentUserId,
  maxHeight = '420px',
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
      sendMessage(message.trim());
      setMessage('');
      setError(null);
    } catch {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Connection lost banner */}
      {!isConnected && (
        <div className="flex items-center gap-2 rounded-t-lg border border-b-0 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Disconnected — reconnecting to chat...</span>
        </div>
      )}

      {/* Send error */}
      {error && (
        <div className="flex items-center gap-2 border border-b-0 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat card — use inline style for height because Tailwind JIT can't purge dynamic class names */}
      <Card
        className={cn(
          'flex flex-col overflow-hidden',
          !isConnected || error ? 'rounded-t-none' : '',
        )}
        style={{ height: maxHeight }}
      >
        {/* Messages scroll area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="p-4">
              {messages.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No messages yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {isConnected
                      ? 'Be the first to say something!'
                      : 'Connecting to chat...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isOwn = msg.user_id === currentUserId;
                    return (
                      <div
                        key={`${msg.user_id}-${msg.timestamp}-${index}`}
                        className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage
                            src={msg.avatar_url}
                            alt={msg.username}
                          />
                          <AvatarFallback className="text-xs">
                            {msg.username?.[0]?.toUpperCase() ?? '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Bubble */}
                        <div
                          className={cn(
                            'flex max-w-[72%] flex-col gap-1',
                            isOwn ? 'items-end' : 'items-start',
                          )}
                        >
                          <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                            <span className="text-xs font-medium">
                              {isOwn ? 'You' : msg.username}
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'rounded-2xl px-4 py-2 text-sm leading-relaxed',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-muted rounded-tl-sm',
                            )}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 p-3"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isConnected ? 'Type a message...' : 'Reconnecting...'
            }
            disabled={!isConnected}
            className="flex-1"
            autoComplete="off"
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
