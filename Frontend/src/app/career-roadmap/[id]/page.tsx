'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { useParams } from 'next/navigation';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { RoadmapSection } from './components/RoadmapSection';
import { Timeline } from './components/Timeline';
import { useAxiosGet } from '@/hooks/useAxios';

interface IRoadmap {
  id: string;
  name: string;
  description: string;
  Subjects: {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
  }[];
}

export default function CareerPathPage() {
  const params = useParams();
  const careerId = (params?.id as string) || '';
  const dispatch = useDispatch();

  const [roadmap, setRoadmap] = useState<IRoadmap[]>([]);
  const [getRoadmaps] = useAxiosGet<
    {
      success?: boolean;
      message?: string;
    } & IRoadmap[]
  >('road_maps/main_concepts/{{careerId}}');

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
          <Timeline>
            {roadmap?.map((section, index) => (
              <RoadmapSection
                key={section.id}
                name={section.name}
                description={section.description}
                subjects={section.Subjects}
                index={index}
              />
            ))}
          </Timeline>
        </motion.div>
      </ParallaxProvider>
    </div>
  );
}
