'use client';
import React, { useState } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import { useParams, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { RoadmapSection } from './components/RoadmapSection';
import { Timeline } from './components/Timeline';
import { MessageCircle } from 'lucide-react';
import { RoadmapAuthor } from '@/hooks/useRoadmapApi';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSection } from './components/CommentSection';
import { useRoadmapDetail } from './hooks/useRoadmapDetail';
import { RoadmapHero } from './components/RoadmapHero';
import { RoadmapHeaderActions } from './components/HeaderActions';

export interface IRoadmap {
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

export interface RoadmapAuthorDetails extends RoadmapAuthor {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface RoadmapDetails {
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
  const showComments = searchParams.get('comments') === 'open';

  const {
    isLoading,
    roadmap,
    roadmapDetails,
    isEnrolling,
    socialActionLoading,
    optimisticState,
    handleEnroll,
    handleSocialAction,
    handleLike,
    handleBookmark,
  } = useRoadmapDetail(careerId);

  const [activeTab, setActiveTab] = useState(
    showComments ? 'comments' : 'content',
  );

  const handleShare = async () => {
    try {
      await navigator.share({
        title: roadmapDetails?.title,
        text: roadmapDetails?.description,
        url: globalThis.location.href,
      });
    } catch {
      navigator.clipboard.writeText(globalThis.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

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
                    <TabLink value="content">Content</TabLink>
                    <TabLink value="comments">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comments ({roadmapDetails?.commentsCount || 0})
                      </div>
                    </TabLink>
                  </TabsList>
                </div>
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
                        <div className="relative mt-8">
                          <div className="from-primary/20 via-primary/5 relative rounded-2xl bg-gradient-to-b to-transparent p-8">
                            <div className="bg-grid-foreground/[0.02] absolute inset-0 rounded-2xl" />
                            <div className="relative">
                              <div className="grid gap-8 lg:grid-cols-2">
                                <RoadmapHero roadmapDetails={roadmapDetails} />
                                <RoadmapHeaderActions
                                  roadmapDetails={roadmapDetails}
                                  roadmapCount={roadmap.length}
                                  currentState={currentState}
                                  socialActionLoading={socialActionLoading}
                                  handleSocialAction={handleSocialAction}
                                  handleLike={handleLike}
                                  handleBookmark={handleBookmark}
                                  handleShare={handleShare}
                                  handleEnroll={handleEnroll}
                                  isEnrolling={isEnrolling}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pb-24">
                          <Timeline>
                            {roadmap?.map(
                              (section: IRoadmap, index: number) => (
                                <RoadmapSection
                                  key={section.id}
                                  name={section.main_concept?.name}
                                  description={
                                    section.main_concept?.description
                                  }
                                  subjects={section.main_concept?.subjects}
                                  index={index}
                                  roadmapId={careerId}
                                />
                              ),
                            )}
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

const TabLink = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => (
  <TabsTrigger
    value={value}
    className="group relative h-full data-[state=active]:bg-transparent"
  >
    <span className="relative z-10 font-medium text-muted-foreground transition-colors group-data-[state=active]:text-primary">
      {children}
    </span>
    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-transparent transition-all duration-300 group-data-[state=active]:h-1 group-data-[state=active]:bg-primary" />
  </TabsTrigger>
);
