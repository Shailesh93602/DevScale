import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { RoadmapDetails } from '../RoadmapDetail';
import { cn } from '@/lib/utils';

interface RoadmapHeaderActionsProps {
  roadmapDetails: RoadmapDetails;
  roadmapCount: number;
  currentState: {
    isLiked: boolean;
    likesCount: number;
    isBookmarked: boolean;
    bookmarksCount: number;
  };
  socialActionLoading: {
    like: boolean;
    bookmark: boolean;
  };
  handleSocialAction: (
    action: (id: string) => Promise<void>,
    type: 'like' | 'bookmark',
  ) => Promise<void>;
  handleLike: (id: string) => Promise<void>;
  handleBookmark: (id: string) => Promise<void>;
  handleShare: () => Promise<void>;
  handleEnroll: () => Promise<void>;
  isEnrolling: boolean;
}

export const RoadmapHeaderActions = ({
  roadmapDetails,
  roadmapCount,
  currentState,
  socialActionLoading,
  handleSocialAction,
  handleLike,
  handleBookmark,
  handleShare,
  handleEnroll,
  isEnrolling,
}: RoadmapHeaderActionsProps) => {
  return (
    <div className="flex flex-col justify-center space-y-6">
      <Card className="overflow-hidden border-none bg-card/60 p-8 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <StatItem icon={<BookOpen />} value={roadmapCount} label="Steps" />
          <StatItem
            icon={<Users />}
            value={roadmapDetails.enrollmentCount || 0}
            label="Enrolled"
          />
          <StatItem
            icon={<Clock />}
            value={roadmapDetails.estimatedTime || '---'}
            label="Duration"
          />
          <StatItem
            icon={<Award />}
            value={roadmapDetails.progress || 0}
            isPercentage
            label="Complete"
          />
        </div>

        {roadmapDetails.progress !== undefined && (
          <div className="mt-8 rounded-lg bg-card p-4">
            <Progress value={roadmapDetails.progress} className="h-2" />
          </div>
        )}

        {/* Social Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <SocialButton
              icon={<Heart />}
              isActive={currentState.isLiked}
              count={currentState.likesCount}
              activeColor="text-red-500"
              activeBg="bg-red/10"
              hoverColor="group-hover:text-red-500"
              hoverBg="group-hover:bg-red/10"
              fillColor="#ef4444"
              isLoading={socialActionLoading.like}
              onClick={() => handleSocialAction(handleLike, 'like')}
              aria-label={
                currentState.isLiked ? 'Unlike roadmap' : 'Like roadmap'
              }
            />

            <SocialButton
              icon={<Bookmark />}
              isActive={currentState.isBookmarked}
              count={currentState.bookmarksCount}
              activeColor="text-orange-500"
              activeBg="bg-orange-500/15"
              hoverColor="group-hover:text-orange-500"
              hoverBg="group-hover:bg-orange-500/15"
              fillColor="#f97316"
              isLoading={socialActionLoading.bookmark}
              onClick={() => handleSocialAction(handleBookmark, 'bookmark')}
              aria-label={
                currentState.isBookmarked
                  ? 'Remove bookmark'
                  : 'Bookmark roadmap'
              }
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share roadmap"
            className="hover:bg-primary/10 h-10 w-10 rounded-full bg-muted transition-all"
          >
            <Share2 className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Button>

          {roadmapDetails?.isEnrolled ? (
            <div className="ml-2 inline-flex animate-fade-up items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-6 py-2.5 text-sm font-bold text-success">
              <CheckCircle size={14} />
              Enrolled
            </div>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="ml-2 font-semibold"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

const StatItem = ({
  icon,
  value,
  label,
  isPercentage,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  isPercentage?: boolean;
}) => (
  <div className="rounded-xl bg-card p-4 text-center shadow-sm">
    <div className="mx-auto h-6 w-6 text-primary">{icon}</div>
    <p className="mt-2 text-2xl font-semibold text-foreground">
      {value}
      {isPercentage ? '%' : ''}
    </p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

interface SocialButtonProps {
  icon: React.ReactElement<{ fill?: string; className?: string }>;
  isActive: boolean;
  count: number;
  activeColor: string;
  activeBg: string;
  hoverColor: string;
  hoverBg: string;
  fillColor: string;
  isLoading: boolean;
  onClick: () => void;
  'aria-label'?: string;
}

const SocialButton = ({
  icon,
  isActive,
  count,
  activeColor,
  activeBg,
  hoverColor,
  hoverBg,
  fillColor,
  isLoading,
  onClick,
  'aria-label': ariaLabel,
}: SocialButtonProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    disabled={isLoading}
    aria-label={ariaLabel}
    className={cn(
      'group flex h-auto items-center gap-2 p-0 transition-all duration-200 hover:bg-transparent',
      'disabled:opacity-70',
      isLoading && 'scale-95',
    )}
  >
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
        'bg-muted',
        !isActive && hoverBg,
        isActive && activeBg,
      )}
    >
      {React.cloneElement(icon, {
        fill: isActive ? fillColor : 'none',
        className: cn(
          'h-5 w-5 transition-all duration-200',
          'text-muted-foreground',
          !isActive && hoverColor,
          isActive && activeColor,
        ),
      } as React.HTMLAttributes<SVGElement> & { fill: string })}
    </div>
    <span
      className={cn(
        'text-sm font-medium transition-all duration-200',
        'text-muted-foreground',
        isActive && activeColor,
      )}
    >
      {count}
    </span>
  </Button>
);
