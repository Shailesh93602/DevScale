import { MessageSquare, Trophy, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from './communityTypes';

export function UserListItem({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.is_online && (
            <div className="bg-green-500 absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background"></div>
          )}
        </div>
        <div>
          <div className="font-medium">{user.username}</div>
          {user.rank && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Trophy className="mr-1 h-3 w-3" />
              Rank #{user.rank}
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label={
          user.is_friend
            ? `Message ${user.username}`
            : `Add ${user.username} as a friend`
        }
      >
        {user.is_friend ? (
          <MessageSquare className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
