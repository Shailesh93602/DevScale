'use client';
import React, { useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function CareerPathPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const careerId = (params?.id as string) || '';
  const dispatch = useDispatch();
  const showComments = searchParams.get('comments') === 'open';

  const [roadmap, setRoadmap] = useState<IRoadmap[]>([]);
  const [getRoadmaps] = useAxiosGet<
    {
      success?: boolean;
      message?: string;
    } & IRoadmap[]
  >('roadmaps/{{careerId}}/main_concepts');

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(showLoader('fetching roadmap'));
      try {
        const response = await getRoadmaps({}, { careerId });
        setRoadmap(response.data ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching resources. Please try again');
      }
      dispatch(hideLoader('fetching roadmap'));
    };
    fetchResources();
  }, [careerId, dispatch]);

  return (
    <div className="min-h-screen bg-bgColor p-6">
      <ParallaxProvider>
        <motion.div
          className="roadmap-content mx-auto max-w-4xl"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.4 }}
        >
          <h1 className="mb-8 text-center text-4xl font-bold text-primary">
            Career Roadmap
          </h1>

          <Tabs defaultValue={showComments ? 'comments' : 'content'}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
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
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection roadmapId={careerId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </ParallaxProvider>
    </div>
  );
}
