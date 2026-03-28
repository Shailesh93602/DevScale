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
import { BaseRoadmap, RoadmapAuthor } from '@/hooks/useRoadmapApi';
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
  tags?: string;
  difficulty?: string;
  estimatedHours?: number;
  popularity?: number;
  version?: string;
  user?: {
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } & RoadmapAuthor;
};

// Create a skeleton loader component for RoadmapCard
export const RoadmapCardSkeleton = () => (
  <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm">
    {/* Header */}
    <div className="relative h-40 animate-pulse rounded-t-xl bg-muted"></div>

    {/* Content */}
    <div className="flex flex-1 flex-col p-5">
      {/* Title */}
      <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted"></div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted"></div>
      </div>

      {/* Categories */}
      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted"></div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
        <div className="flex-1">
          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
          <div className="mt-1 h-3 w-32 animate-pulse rounded bg-muted"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex gap-3">
          <div className="h-5 w-14 animate-pulse rounded bg-muted"></div>
          <div className="h-5 w-14 animate-pulse rounded bg-muted"></div>
          <div className="h-5 w-14 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
      </div>
    </div>
  </div>
);

export interface RoadmapCardProps {
  roadmap: RoadmapType;
  index: number;
  onLike?: (roadmapId: string) => Promise<void>;
  onBookmark?: (roadmapId: string) => Promise<void>;
  onCommentClick?: () => void;
  showViewButton?: boolean;
}

export const getDifficultyColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'easy':
      return 'bg-green-500/20 text-green-600';
    case 'medium':
      return 'bg-blue-500/20 text-blue-600';
    case 'hard':
      return 'bg-purple-500/20 text-purple-600';
    case 'beginner':
      return 'bg-green-500/20 text-green-600';
    case 'intermediate':
      return 'bg-blue-500/20 text-blue-600';
    case 'advanced':
      return 'bg-purple-500/20 text-purple-600';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const RoadmapCard = ({
  roadmap,
  index = 0,
  onLike,
  onBookmark,
  onCommentClick,
  showViewButton = true,
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
    if (onCommentClick) {
      onCommentClick();
    } else {
      router.push(
        `/career-roadmap/${roadmap.slug ?? roadmap.id}?comments=open`,
      );
    }
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
    router.push(`/career-roadmap/${roadmap.slug ?? roadmap.id}`);
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

        <div className="flex items-start justify-between">
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-primary">
            <Route size={24} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {roadmap.difficulty ? (
              <Badge
                variant="outline"
                className={`uppercase ${getDifficultyColor(roadmap.difficulty)}`}
              >
                {roadmap.difficulty}
              </Badge>
            ) : null}

            {roadmap.isEnrolled ? (
              <Badge className="bg-primary/80">Enrolled</Badge>
            ) : null}

            {roadmap.isFeatured ? (
              <Badge
                variant="secondary"
                className="border-warning/20 bg-warning/10 text-warning"
              >
                Featured
              </Badge>
            ) : null}

            {roadmap.popularity && roadmap.popularity > 100 ? (
              <Badge
                variant="secondary"
                className="border-orange-500/20 bg-orange-500/10 text-orange-600"
              >
                Popular
              </Badge>
            ) : null}
          </div>
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
          {roadmap.steps && roadmap.steps > 0 ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Map className="h-3 w-3" />
              {roadmap.steps} steps
            </Badge>
          ) : null}

          {roadmap.estimatedTime ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Clock className="h-3 w-3" />
              {roadmap.estimatedTime}
            </Badge>
          ) : null}

          {roadmap.estimatedHours && roadmap.estimatedHours > 0 ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Clock className="h-3 w-3" />
              {roadmap.estimatedHours} hours
            </Badge>
          ) : null}

          {roadmap.enrollmentCount && roadmap.enrollmentCount > 0 ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              <Users className="h-3 w-3" />
              {roadmap.enrollmentCount.toLocaleString()} enrolled
            </Badge>
          ) : null}

          {roadmap.version ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 font-normal"
            >
              v{roadmap.version}
            </Badge>
          ) : null}
        </div>

        {roadmap.progress !== undefined && roadmap.progress > 0 ? (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{roadmap.progress}%</span>
            </div>
            <Progress value={roadmap.progress} className="h-1.5" />
          </div>
        ) : null}
      </div>

      {/* Card footer with author info and actions */}
      <div className="border-t px-6 py-4">
        <div className="flex flex-col space-y-3">
          {/* Tags Section */}
          {roadmap.tags && roadmap.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {roadmap.tags.split(',').map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          ) : null}

          {/* Author and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {roadmap?.user?.avatar_url ? (
                  <AvatarImage
                    src={roadmap?.user?.avatar_url}
                    alt={
                      (roadmap?.user?.first_name && roadmap?.user?.last_name
                        ? `${roadmap.user.first_name} ${roadmap.user.last_name}`
                        : roadmap?.user?.first_name ||
                          roadmap?.user?.username) || ''
                    }
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(
                      roadmap?.user?.first_name ||
                      roadmap?.user?.username ||
                      'U'
                    )
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {roadmap?.user?.first_name && roadmap?.user?.last_name
                  ? `${roadmap.user.first_name} ${roadmap.user.last_name}`
                  : roadmap?.user?.first_name || roadmap?.user?.username}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Like"
                onClick={handleLikeClick}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 transition-colors',
                  isLiked
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : '',
                )}
              >
                <Heart
                  className={cn('h-4 w-4', isLiked ? 'fill-current' : '')}
                />
                <span className="text-xs font-medium">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                aria-label="Comment"
                onClick={handleComment}
                className="flex items-center gap-1.5 rounded-full px-3 hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {roadmap.commentsCount > 0 ? roadmap.commentsCount : ''}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                aria-label="Bookmark"
                onClick={handleBookmarkClick}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 transition-colors',
                  isBookmarked
                    ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                    : '',
                )}
              >
                <Bookmark
                  className={cn('h-4 w-4', isBookmarked ? 'fill-current' : '')}
                />
                <span className="text-xs font-medium">{bookmarkCount}</span>
              </Button>
            </div>
          </div>
        </div>

        {showViewButton ? (
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleViewRoadmap}>
              View Roadmap <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default RoadmapCard;
