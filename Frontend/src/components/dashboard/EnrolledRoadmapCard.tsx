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
      className="overflow-hidden rounded-lg bg-card shadow-md"
    >
      <div className="h-32 bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
            width={500}
            height={500}
          />
        ) : (
          <div className="from-primary/20 flex h-full w-full items-center justify-center bg-gradient-to-br to-secondary/20">
            <span className="text-lg font-semibold text-muted-foreground">
              {title.substring(0, 1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/career-roadmap/${id}`}>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-foreground hover:text-primary">
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
          <span className="text-sm text-muted-foreground">{author?.name}</span>
        </div>

        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${progressBarColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mb-4 flex justify-between text-sm text-muted-foreground">
          <span>
            {completedTopics} of {totalTopics} topics
          </span>
          <span>{progressPercentage}% complete</span>
        </div>

        {nextTopic && (
          <div className="mt-4 rounded-md bg-muted/50 p-3">
            <h4 className="mb-1 text-sm font-medium text-foreground">
              Continue learning:
            </h4>
            <div className="flex items-center justify-between">
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {nextTopic.title}
              </p>
              {nextTopic.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{nextTopic.estimatedTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Link
          href={`/career-roadmap/${id}`}
          className="hover:text-primary/80 mt-4 flex items-center justify-end text-sm font-medium text-primary"
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default EnrolledRoadmapCard;
