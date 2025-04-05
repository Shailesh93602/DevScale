import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Route,
  Map,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BaseRoadmap } from '@/hooks/useRoadmapApi';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';

export type RoadmapType = BaseRoadmap & {
  description: string;
  enrollmentCount?: number;
  rating?: number;
  steps?: number;
  estimatedTime?: string;
  progress?: number;
  isEnrolled?: boolean;
  isFeatured?: boolean;
};

// Create a skeleton loader component for RoadmapCard
export const RoadmapCardSkeleton = () => (
  <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm">
    {/* Header */}
    <div className="relative h-40 animate-pulse rounded-t-xl bg-gray-200"></div>

    {/* Content */}
    <div className="flex flex-1 flex-col p-5">
      {/* Title */}
      <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
      </div>

      {/* Categories */}
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex gap-3">
          <div className="h-5 w-14 animate-pulse rounded bg-gray-200"></div>
          <div className="h-5 w-14 animate-pulse rounded bg-gray-200"></div>
          <div className="h-5 w-14 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

export interface RoadmapCardProps {
  roadmap: RoadmapType;
  index: number;
  onLike?: (roadmapId: string) => Promise<void>;
  onBookmark?: (roadmapId: string) => Promise<void>;
}

export const getDifficultyColor = (level?: string) => {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const RoadmapCard = ({
  roadmap,
  index = 0,
  onLike,
  onBookmark,
}: RoadmapCardProps) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(roadmap.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(roadmap.isBookmarked);
  const [likeCount, setLikeCount] = useState(roadmap.likesCount || 0);
  const [bookmarkCount, setBookmarkCount] = useState(
    roadmap.bookmarksCount || 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { handleLike, handleBookmark } = useRoadmapSocial();

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      await handleLike(roadmap.id);
      setIsLiked(!isLiked);
      setLikeCount((prevCount: number) =>
        isLiked ? prevCount - 1 : prevCount + 1,
      );
      onLike?.(roadmap.id);
    } catch (err) {
      console.error('Failed to update like status:', err);
      toast.error('Failed to update like status');
      setIsLiked(isLiked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/career-roadmap/${roadmap.id}?comments=open`);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      await handleBookmark(roadmap.id);
      setIsBookmarked(!isBookmarked);
      setBookmarkCount((prevCount: number) =>
        isBookmarked ? prevCount - 1 : prevCount + 1,
      );
      onBookmark?.(roadmap.id);
    } catch (err) {
      console.error('Failed to update bookmark status:', err);
      toast.error('Failed to update bookmark status');
      setIsBookmarked(isBookmarked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRoadmap = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/career-roadmap/${roadmap.id}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg"
    >
      {/* Card header with difficulty badge and icon */}
      <div className="relative p-6 pb-4">
        <div className="to-primary/5 absolute inset-0 bg-gradient-to-br from-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {roadmap.difficulty && (
          <Badge
            variant="outline"
            className={`absolute right-6 top-6 ${getDifficultyColor(roadmap.difficulty)}`}
          >
            {roadmap.difficulty}
          </Badge>
        )}

        <div className="flex items-start justify-between">
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-primary">
            <Route size={24} />
          </div>

          {roadmap.isEnrolled && (
            <Badge className="bg-primary/80">Enrolled</Badge>
          )}

          {roadmap.isFeatured && (
            <Badge
              variant="secondary"
              className="border-yellow-200 bg-yellow-100 text-yellow-800"
            >
              Featured
            </Badge>
          )}
        </div>

        <h3 className="mb-3 text-lg font-semibold leading-tight tracking-tight">
          {roadmap.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {roadmap.description}
        </p>
      </div>

      {/* Metadata section */}
      <div className="flex-grow px-6 py-2">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {roadmap.steps && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Map className="h-3 w-3" />
              {roadmap.steps} steps
            </Badge>
          )}

          {roadmap.estimatedTime && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Clock className="h-3 w-3" />
              {roadmap.estimatedTime}
            </Badge>
          )}

          {roadmap.enrollmentCount && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Users className="h-3 w-3" />
              {roadmap.enrollmentCount.toLocaleString()} enrolled
            </Badge>
          )}
        </div>

        {roadmap.progress !== undefined && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{roadmap.progress}%</span>
            </div>
            <Progress value={roadmap.progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Card footer with author info and actions */}
      <div className="border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${roadmap?.author?.name}`}
              />
              <AvatarFallback>
                {roadmap?.author?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {roadmap?.author?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 transition-colors',
                isLiked &&
                  'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30',
              )}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              <span className="text-xs font-medium">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center gap-1.5 rounded-full px-3 hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">
                {roadmap.commentsCount || 0}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 transition-colors',
                isBookmarked &&
                  'bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
              )}
            >
              <Bookmark
                className={cn('h-4 w-4', isBookmarked && 'fill-current')}
              />
              <span className="text-xs font-medium">{bookmarkCount}</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            className="hover:bg-primary/90 bg-primary"
            onClick={handleViewRoadmap}
          >
            View Roadmap <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoadmapCard;
