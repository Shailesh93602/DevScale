'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { useParams, useSearchParams } from 'next/navigation';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { RoadmapSection } from './components/RoadmapSection';
import { Timeline } from './components/Timeline';
import { useAxiosGet } from '@/hooks/useAxios';
import { CommentSection } from './components/CommentSection';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import RoadmapCard from '@/components/Roadmap/RoadmapCard';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';
import { RoadmapAuthor } from '@/hooks/useRoadmapApi';

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
        name: string;
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
  author: RoadmapAuthorDetails;
  thumbnail?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
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

export default function CareerPathPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const careerId = (params?.id as string) || '';
  const dispatch = useDispatch();
  const showComments = searchParams.get('comments') === 'open';
  const commentsRef = useRef<HTMLDivElement>(null);
  const { handleLike, handleBookmark } = useRoadmapSocial();

  const [isCommentsOpen, setIsCommentsOpen] = useState(showComments);
  const [roadmap, setRoadmap] = useState<IRoadmap[]>([]);
  const [roadmapDetails, setRoadmapDetails] = useState<RoadmapDetails | null>(
    null,
  );
  const [getRoadmaps] = useAxiosGet<
    {
      success?: boolean;
      message?: string;
    } & IRoadmap[]
  >('roadmaps/{{careerId}}/main_concepts');
  const [getRoadmapDetails] = useAxiosGet<{ roadMap: RoadmapDetails }>(
    'roadmaps/{{careerId}}',
  );

  const fetchResources = async () => {
    dispatch(showLoader('fetching roadmap'));
    try {
      const [roadmapResponse, detailsResponse] = await Promise.all([
        getRoadmaps({}, { careerId }),
        getRoadmapDetails({}, { careerId }),
      ]);
      setRoadmap(roadmapResponse.data ?? []);
      setRoadmapDetails(detailsResponse.data?.roadMap ?? null);

      if (showComments) {
        setTimeout(() => {
          commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching resources. Please try again');
    }
    dispatch(hideLoader('fetching roadmap'));
  };

  useEffect(() => {
    fetchResources();
  }, [careerId, showComments]);

  const handleCommentClick = () => {
    setIsCommentsOpen(true);
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSocialAction = async (action: (id: string) => Promise<void>) => {
    try {
      await action(careerId);
      // Refetch the roadmap details to get updated social stats
      const detailsResponse = await getRoadmapDetails({}, { careerId });
      setRoadmapDetails(detailsResponse.data?.roadMap ?? null);
    } catch (error) {
      console.error('Failed to update social action:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bgColor p-6">
      <ParallaxProvider>
        <motion.div
          className="roadmap-content mx-auto max-w-4xl"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.4 }}
        >
          {roadmapDetails && (
            <div className="mb-8">
              <RoadmapCard
                roadmap={{
                  ...roadmapDetails,
                  steps: roadmap.length,
                }}
                index={0}
                onLike={() => handleSocialAction(handleLike)}
                onBookmark={() => handleSocialAction(handleBookmark)}
                onCommentClick={handleCommentClick}
                showViewButton={false}
              />
            </div>
          )}

          <Timeline>
            {roadmap?.map((section, index) => (
              <RoadmapSection
                key={section.id}
                name={section.main_concept?.name}
                description={section.main_concept?.description}
                subjects={section.main_concept?.subjects}
                index={index}
              />
            ))}
          </Timeline>

          <div className="mt-8" ref={commentsRef}>
            <Collapsible
              open={isCommentsOpen}
              onOpenChange={setIsCommentsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-xl font-semibold">Comments</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isCommentsOpen ? 'rotate-180' : ''
                      }`}
                    />
                    <span className="sr-only">Toggle comments</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <div className="rounded-md border px-4 py-2">
                  <CommentSection roadmapId={careerId} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </motion.div>
      </ParallaxProvider>
    </div>
  );
}
