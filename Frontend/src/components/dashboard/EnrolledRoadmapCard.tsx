import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { calculateProgressPercentage } from '@/lib/utils';
import Image from 'next/image';

export interface EnrolledRoadmapCardProps {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  progress: number;
  lastAccessed: string;
  totalTopics: number;
  completedTopics: number;
  nextTopic?: {
    id: string;
    title: string;
    estimatedTime: string;
  };
  thumbnail?: string;
  categories?: string[];
}

const EnrolledRoadmapCard: React.FC<EnrolledRoadmapCardProps> = ({
  id,
  title,
  author,
  progress,
  totalTopics,
  completedTopics,
  nextTopic,
  thumbnail,
}) => {
  const progressPercentage =
    progress ?? calculateProgressPercentage(completedTopics, totalTopics);
  const progressBarColor =
    progressPercentage >= 100
      ? 'bg-green-500'
      : progressPercentage > 75
        ? 'bg-blue-500'
        : progressPercentage > 50
          ? 'bg-indigo-500'
          : progressPercentage > 25
            ? 'bg-purple-500'
            : 'bg-pink-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
    >
      <div className="h-32 bg-gray-200 dark:bg-gray-700">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
            width={500}
            height={500}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-900/20 dark:to-purple-900/20">
            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
              {title.substring(0, 1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/career-roadmap/${id}`}>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
            {title}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-2">
          <Avatar
            src={author?.profileImage}
            alt={author?.name}
            fallback={author?.name?.charAt(0)?.toUpperCase()}
            size="xs"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {author?.name}
          </span>
        </div>

        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full rounded-full ${progressBarColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mb-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {completedTopics} of {totalTopics} topics
          </span>
          <span>{progressPercentage}% complete</span>
        </div>

        {nextTopic && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
            <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Continue learning:
            </h4>
            <div className="flex items-center justify-between">
              <p className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                {nextTopic.title}
              </p>
              {nextTopic.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} />
                  <span>{nextTopic.estimatedTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Link
          href={`/career-roadmap/${id}`}
          className="mt-4 flex items-center justify-end text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default EnrolledRoadmapCard;
