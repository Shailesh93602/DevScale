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
    completed_topic: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    enrolled_roadmap: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    completed_roadmap: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    created_roadmap: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20',
    liked_roadmap: 'text-red-500 bg-red-100 dark:bg-red-900/20',
    commented: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20',
    bookmarked: 'text-pink-500 bg-pink-100 dark:bg-pink-900/20',
    friend_activity: 'text-teal-500 bg-teal-100 dark:bg-teal-900/20',
  };

  const Icon = iconMap[type];
  const colorClass = colorMap[type];
  const formattedTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
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
        <p className="text-sm text-gray-700 dark:text-gray-300">
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
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
