'use client';
import React, { useEffect, useState } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import { useParams, useSearchParams } from 'next/navigation';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { RoadmapSection } from './components/RoadmapSection';
import { Timeline } from './components/Timeline';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { CommentSection } from './components/CommentSection';
import {
  MessageCircle,
  BookOpen,
  Users,
  Clock,
  Award,
  Heart,
  Bookmark,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';
import { RoadmapAuthor } from '@/hooks/useRoadmapApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface IRoadmap {
  id: string;
  main_concept: {
    id: string;
    name: string;
    description: string;
    subjects: {
      id: string;
      subject: {
        id: string;
        title: string;
        description: string;
        icon: React.ElementType;
      };
    }[];
  };
}

interface RoadmapAuthorDetails extends RoadmapAuthor {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface RoadmapDetails {
  id: string;
  title: string;
  description: string;
  user?: RoadmapAuthorDetails;
  thumbnail?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  isEnrolled?: boolean;
  isFeatured?: boolean;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  enrollmentCount?: number;
  estimatedTime?: string;
  progress?: number;
  tags: string;
}

const RoadmapSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <div className="from-primary/5 relative rounded-2xl bg-gradient-to-b to-transparent p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column Skeleton */}
          <div className="space-y-6 rounded-2xl bg-card/60 p-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-card/60 p-8">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl bg-card p-4">
                    <Skeleton className="mx-auto h-6 w-6" />
                    <Skeleton className="mx-auto mt-2 h-8 w-12" />
                    <Skeleton className="mx-auto mt-1 h-3 w-16" />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="mt-8 flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Content Skeleton */}
      <div className="space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section} className="relative pl-8">
            <div className="absolute left-0 top-0 h-full w-px bg-border" />
            <div className="absolute -left-2 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-20 w-full" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-border p-4"
                  >
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-2 h-16 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CareerPathPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const careerId = (params?.id as string) || '';
  const dispatch = useDispatch();
  const showComments = searchParams.get('comments') === 'open';
  const { handleLike, handleBookmark } = useRoadmapSocial();
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(
    showComments ? 'comments' : 'content',
  );
  const [roadmap, setRoadmap] = useState<IRoadmap[]>([]);
  const [roadmapDetails, setRoadmapDetails] = useState<RoadmapDetails | null>(
    null,
  );

  const [getRoadmapDetails] = useAxiosGet<
    RoadmapDetails & {
      main_concepts: IRoadmap[];
    }
  >('/roadmaps/{{careerId}}');

  const [socialActionLoading, setSocialActionLoading] = useState<{
    like: boolean;
    bookmark: boolean;
  }>({
    like: false,
    bookmark: false,
  });

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollInRoadmap] = useAxiosPost('/roadmaps/enroll');

  const handleEnroll = async () => {
    if (isEnrolling || !careerId) return;
    setIsEnrolling(true);
    try {
      const response = await enrollInRoadmap({ roadmapId: careerId });
      if (response?.success) {
        toast.success("Awesome! You're now enrolled ✨");
        if (roadmapDetails) {
          setRoadmapDetails({
            ...roadmapDetails,
            isEnrolled: true,
            enrollmentCount: (roadmapDetails.enrollmentCount || 0) + 1,
          });
        }
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } catch (e) {
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const [optimisticState, setOptimisticState] = useState<{
    isLiked: boolean;
    likesCount: number;
    isBookmarked: boolean;
    bookmarksCount: number;
  } | null>(null);

  useEffect(() => {
    if (roadmapDetails) {
      setOptimisticState({
        isLiked: roadmapDetails.isLiked,
        likesCount: roadmapDetails.likesCount,
        isBookmarked: roadmapDetails.isBookmarked,
        bookmarksCount: roadmapDetails.bookmarksCount,
      });
    }
  }, [roadmapDetails]);

  const fetchResources = async () => {
    setIsLoading(true);
    dispatch(showLoader('fetching roadmap'));
    try {
      const detailsResponse = await getRoadmapDetails({}, { careerId });
      const roadmapDataRaw = detailsResponse.data as any;
      const roadmapData = roadmapDataRaw?.data
        ? roadmapDataRaw.data
        : roadmapDataRaw;

      if (roadmapData) {
        setRoadmapDetails(roadmapData);
        setRoadmap(roadmapData.main_concepts || []);
      }

      if (showComments) {
        setActiveTab('comments');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching resources. Please try again');
    }
    dispatch(hideLoader('fetching roadmap'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [careerId, showComments]);

  const handleCommentClick = () => {
    setActiveTab('comments');
  };

  const handleSocialAction = async (
    action: (id: string) => Promise<void>,
    type: 'like' | 'bookmark',
  ) => {
    if (socialActionLoading[type]) return;

    try {
      setSocialActionLoading((prev) => ({ ...prev, [type]: true }));

      // Optimistic update — applied immediately before the request
      if (type === 'like') {
        setOptimisticState((prev) =>
          prev
            ? {
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked
                  ? prev.likesCount - 1
                  : prev.likesCount + 1,
              }
            : null,
        );
      } else {
        setOptimisticState((prev) =>
          prev
            ? {
                ...prev,
                isBookmarked: !prev.isBookmarked,
                bookmarksCount: prev.isBookmarked
                  ? prev.bookmarksCount - 1
                  : prev.bookmarksCount + 1,
              }
            : null,
        );
      }

      // Fire the API action — optimistic state already shows the update
      await action(careerId);
    } catch {
      // Revert optimistic update on error
      if (roadmapDetails) {
        setOptimisticState({
          isLiked: roadmapDetails.isLiked,
          likesCount: roadmapDetails.likesCount,
          isBookmarked: roadmapDetails.isBookmarked,
          bookmarksCount: roadmapDetails.bookmarksCount,
        });
      }
      toast.error(`Failed to ${type} roadmap`);
    } finally {
      setSocialActionLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: roadmapDetails?.title,
        text: roadmapDetails?.description,
        url: window.location.href,
      });
    } catch {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const tags = roadmapDetails?.tags ? roadmapDetails.tags.split(',') : [];

  const currentState = optimisticState ||
    roadmapDetails || {
      isLiked: false,
      likesCount: 0,
      isBookmarked: false,
      bookmarksCount: 0,
    };

  return (
    <div className="min-h-screen bg-background">
      <ParallaxProvider>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="relative mt-8 border-none bg-card shadow-xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Sticky Tabs Navigation */}
              <div className="sticky top-0 z-40 bg-card shadow-md">
                <div className="border-b border-border px-6">
                  <TabsList className="h-16 w-full justify-start gap-8 bg-transparent">
                    <TabsTrigger
                      value="content"
                      className="group relative h-full data-[state=active]:bg-transparent"
                    >
                      <span className="relative z-10 font-medium text-muted-foreground transition-colors group-data-[state=active]:text-primary">
                        Content
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-transparent transition-all duration-300 group-data-[state=active]:h-1 group-data-[state=active]:bg-primary" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className="group relative h-full data-[state=active]:bg-transparent"
                      onClick={handleCommentClick}
                    >
                      <span className="relative z-10 flex items-center gap-2 font-medium text-muted-foreground transition-colors group-data-[state=active]:text-primary">
                        <MessageCircle className="h-4 w-4" />
                        Comments ({roadmapDetails?.commentsCount || 0})
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-transparent transition-all duration-300 group-data-[state=active]:h-1 group-data-[state=active]:bg-primary" />
                    </TabsTrigger>
                  </TabsList>
                </div>
                {/* Gradient overlay for smooth transition */}
                <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-card" />
              </div>

              <div className="relative">
                <TabsContent
                  value="content"
                  className="focus-visible:outline-none"
                >
                  <div className="space-y-8 px-6">
                    {isLoading || !roadmapDetails ? (
                      <RoadmapSkeleton />
                    ) : (
                      <>
                        {/* Hero Section */}
                        <div className="relative mt-8">
                          <div className="from-primary/20 via-primary/5 relative rounded-2xl bg-gradient-to-b to-transparent p-8">
                            <div className="bg-grid-foreground/[0.02] absolute inset-0 rounded-2xl" />
                            <div className="relative">
                              <div className="grid gap-8 lg:grid-cols-2">
                                {/* Left Column - Title and Meta */}
                                <div className="flex flex-col justify-center space-y-6 rounded-2xl bg-card/60 p-8 backdrop-blur-sm">
                                  <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant="outline"
                                        className="border-primary/30 bg-primary/5 text-primary"
                                      >
                                        {roadmapDetails.difficulty?.toUpperCase()}
                                      </Badge>
                                      {roadmapDetails.isFeatured && (
                                        <Badge
                                          variant="secondary"
                                          className="bg-orange/10 text-orange"
                                        >
                                          FEATURED
                                        </Badge>
                                      )}
                                    </div>
                                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                      {roadmapDetails.title}
                                    </h1>
                                    <p className="text-lg text-muted-foreground">
                                      {roadmapDetails.description}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="bg-muted text-muted-foreground"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="flex items-center space-x-4 rounded-lg bg-card/80 p-4 shadow-sm">
                                    <Avatar className="ring-primary/10 h-12 w-12 ring-2">
                                      <AvatarImage
                                        src={
                                          roadmapDetails?.user?.avatar_url ||
                                          undefined
                                        }
                                      />
                                      <AvatarFallback className="bg-primary/5 text-primary">
                                        {(
                                          roadmapDetails?.user
                                            ?.full_name?.[0] ||
                                          roadmapDetails?.user?.username[0]
                                        )?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {roadmapDetails?.user?.full_name ||
                                          roadmapDetails?.user?.username}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Updated{' '}
                                        {new Date(
                                          roadmapDetails.updated_at ||
                                            roadmapDetails.updatedAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column - Stats and Actions */}
                                <div className="flex flex-col justify-center space-y-6">
                                  <Card className="overflow-hidden border-none bg-card/60 p-8 shadow-xl backdrop-blur-sm">
                                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                      <div className="rounded-xl bg-card p-4 text-center shadow-sm">
                                        <BookOpen className="mx-auto h-6 w-6 text-primary" />
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                          {roadmap.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Steps
                                        </p>
                                      </div>
                                      <div className="rounded-xl bg-card p-4 text-center shadow-sm">
                                        <Users className="mx-auto h-6 w-6 text-primary" />
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                          {roadmapDetails.enrollmentCount || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Enrolled
                                        </p>
                                      </div>
                                      <div className="rounded-xl bg-card p-4 text-center shadow-sm">
                                        <Clock className="mx-auto h-6 w-6 text-primary" />
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                          {roadmapDetails.estimatedTime ||
                                            '---'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Duration
                                        </p>
                                      </div>
                                      <div className="rounded-xl bg-card p-4 text-center shadow-sm">
                                        <Award className="mx-auto h-6 w-6 text-primary" />
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                          {roadmapDetails.progress || 0}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Complete
                                        </p>
                                      </div>
                                    </div>

                                    {roadmapDetails.progress !== undefined && (
                                      <div className="mt-8 rounded-lg bg-card p-4">
                                        <Progress
                                          value={roadmapDetails.progress}
                                          className="h-2"
                                        />
                                      </div>
                                    )}

                                    {/* New Social Actions Design */}
                                    <div className="mt-8 flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-6">
                                        <Button
                                          variant="ghost"
                                          onClick={() =>
                                            handleSocialAction(
                                              handleLike,
                                              'like',
                                            )
                                          }
                                          disabled={socialActionLoading.like}
                                          className={cn(
                                            'group flex h-auto items-center gap-2 p-0 transition-all duration-200 hover:bg-transparent',
                                            'disabled:opacity-70',
                                            socialActionLoading.like &&
                                              'scale-95',
                                          )}
                                        >
                                          <div
                                            className={cn(
                                              'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                                              'bg-muted',
                                              !currentState.isLiked &&
                                                'group-hover:bg-red/10',
                                              currentState.isLiked &&
                                                'bg-red/10',
                                            )}
                                          >
                                            <Heart
                                              fill={
                                                currentState.isLiked
                                                  ? '#ef4444'
                                                  : 'none'
                                              }
                                              className={cn(
                                                'h-5 w-5 transition-all duration-200',
                                                'text-muted-foreground',
                                                !currentState.isLiked &&
                                                  'group-hover:text-red-500',
                                                currentState.isLiked &&
                                                  'text-red-500',
                                              )}
                                            />
                                          </div>
                                          <span
                                            className={cn(
                                              'text-sm font-medium transition-all duration-200',
                                              'text-muted-foreground',
                                              currentState.isLiked &&
                                                'text-red-500',
                                            )}
                                          >
                                            {currentState.likesCount}
                                          </span>
                                        </Button>

                                        <Button
                                          variant="ghost"
                                          onClick={() =>
                                            handleSocialAction(
                                              handleBookmark,
                                              'bookmark',
                                            )
                                          }
                                          disabled={
                                            socialActionLoading.bookmark
                                          }
                                          className={cn(
                                            'group flex h-auto items-center gap-2 p-0 transition-all duration-200 hover:bg-transparent',
                                            'disabled:opacity-70',
                                            socialActionLoading.bookmark &&
                                              'scale-95',
                                          )}
                                        >
                                          <div
                                            className={cn(
                                              'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                                              'bg-muted',
                                              !currentState.isBookmarked &&
                                                'group-hover:bg-orange-500/15',
                                              currentState.isBookmarked &&
                                                'bg-orange-500/15',
                                            )}
                                          >
                                            <Bookmark
                                              fill={
                                                currentState.isBookmarked
                                                  ? '#f97316'
                                                  : 'none'
                                              }
                                              className={cn(
                                                'h-5 w-5 transition-all duration-200',
                                                'text-muted-foreground',
                                                !currentState.isBookmarked &&
                                                  'group-hover:text-orange-500',
                                                currentState.isBookmarked &&
                                                  'text-orange-500',
                                              )}
                                            />
                                          </div>
                                          <span
                                            className={cn(
                                              'text-sm font-medium transition-all duration-200',
                                              'text-muted-foreground',
                                              currentState.isBookmarked &&
                                                'text-orange-500',
                                            )}
                                          >
                                            {currentState.bookmarksCount}
                                          </span>
                                        </Button>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleShare}
                                        className="hover:bg-primary/10 h-10 w-10 rounded-full bg-muted transition-all"
                                      >
                                        <Share2 className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                                      </Button>

                                      {!roadmapDetails?.isEnrolled && (
                                        <Button
                                          onClick={handleEnroll}
                                          disabled={isEnrolling}
                                          className="ml-2 font-semibold"
                                        >
                                          {isEnrolling
                                            ? 'Enrolling...'
                                            : 'Enroll Now'}
                                        </Button>
                                      )}
                                      {roadmapDetails?.isEnrolled && (
                                        <div className="ml-2 inline-flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-6 py-2.5 text-sm font-bold text-success animate-fade-up">
                                          <CheckCircle size={14} />
                                          Enrolled
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Roadmap Content */}
                        <div className="pb-24">
                          <Timeline>
                            {roadmap?.map((section, index) => (
                              <RoadmapSection
                                key={section.id}
                                name={section.main_concept?.name}
                                description={section.main_concept?.description}
                                subjects={section.main_concept?.subjects}
                                index={index}
                                roadmapId={careerId}
                              />
                            ))}
                          </Timeline>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="comments"
                  className="border-none focus-visible:outline-none"
                >
                  <div className="space-y-6 px-6 pb-24 pt-8">
                    <CommentSection roadmapId={careerId} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </ParallaxProvider>
    </div>
  );
}
