import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users } from 'lucide-react';
import { formatNumber, truncateText } from '@/lib/utils';

export interface RecommendedRoadmapCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
  };
  enrollmentCount: number;
  rating: number;
  topics: number;
  thumbnail?: string;
  matchScore: number;
  matchReason: string;
}

const RecommendedRoadmapCard: React.FC<RecommendedRoadmapCardProps> = ({
  id,
  title,
  description,
  author,
  enrollmentCount,
  rating,
  topics,
  thumbnail,
  matchScore,
  matchReason,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800"
    >
      <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-pink-500/20 dark:from-indigo-900/20 dark:to-pink-900/20">
            <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
              {title.substring(0, 1)}
            </span>
          </div>
        )}

        <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
          {matchScore}% Match
        </div>
      </div>

      <div className="p-4">
        <Link href={`/career-roadmap/${id}`}>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
            {title}
          </h3>
        </Link>

        <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          By {author?.name}
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {truncateText(description, 120)}
        </p>

        <div className="mb-3 text-xs italic text-gray-500 dark:text-gray-400">
          {matchReason}
        </div>

        <div className="mt-4 flex justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Star size={16} className="text-amber-500" />
            <span className="font-semibold">{rating?.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users size={14} />
            <span>{formatNumber(enrollmentCount)}</span>
            <span className="ml-2">{topics} topics</span>
          </div>
        </div>

        <Link
          href={`/career-roadmap/${id}`}
          className="bg--primary mt-4 block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary2"
        >
          Explore Roadmap
        </Link>
      </div>
    </motion.div>
  );
};

export default RecommendedRoadmapCard;
