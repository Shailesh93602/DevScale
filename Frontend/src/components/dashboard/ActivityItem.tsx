import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  Award,
  Heart,
  Bookmark,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import Avatar from '@/components/Avatar';

export interface ActivityItemProps {
  id: string;
  type:
    | 'completed_topic'
    | 'enrolled_roadmap'
    | 'completed_roadmap'
    | 'created_roadmap'
    | 'liked_roadmap'
    | 'commented'
    | 'bookmarked'
    | 'friend_activity';
  description: string;
  timestamp: string;
  roadmapId?: string;
  roadmapTitle?: string;
  user?: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  description,
  timestamp,
  roadmapId,
  roadmapTitle,
  user,
}) => {
  const iconMap = {
    completed_topic: BookOpen,
    enrolled_roadmap: UserPlus,
    completed_roadmap: Award,
    created_roadmap: BookOpen,
    liked_roadmap: Heart,
    commented: MessageCircle,
    bookmarked: Bookmark,
    friend_activity: UserPlus,
  };

  const colorMap = {
    completed_topic: 'text-green bg-green/10',
    enrolled_roadmap: 'text-blue bg-blue/10',
    completed_roadmap: 'text-purple bg-purple/10',
    created_roadmap: 'text-orange bg-orange/10',
    liked_roadmap: 'text-red bg-red/10',
    commented: 'text-indigo bg-indigo/10',
    bookmarked: 'text-pink bg-pink/10',
    friend_activity: 'text-teal bg-teal/10',
  };

  const Icon = iconMap[type];
  const colorClass = colorMap[type];
  const formattedTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      {user ? (
        <Avatar
          src={user.profileImage}
          alt={user.name}
          fallback={user.name.charAt(0).toUpperCase()}
          className="h-8 w-8"
        />
      ) : (
        <div className={`rounded-full p-2 ${colorClass}`}>
          <Icon size={16} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          {user && (
            <Link
              href={`/profile/${user.id}`}
              className="font-medium hover:underline"
            >
              {user.name}
            </Link>
          )}
          {user && ' '}
          {description}
          {roadmapId && roadmapTitle && (
            <>
              {' '}
              <Link
                href={`/career-roadmap/${roadmapId}`}
                className="font-medium hover:underline"
              >
                {roadmapTitle}
              </Link>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{formattedTime}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
