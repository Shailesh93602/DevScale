'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ParallaxProvider } from 'react-scroll-parallax';
import { useParams } from 'next/navigation';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchData } from '@/app/services/fetchData';
import { RoadmapSection } from './components/RoadmapSection';
import { Timeline } from './components/Timeline';

export default function CareerPathPage() {
  const params = useParams();
  const careerId = params?.id || '';
  const dispatch = useDispatch();

  const [roadmap, setRoadmap] = useState<
    {
      id: string;
      name: string;
      description: string;
      Subjects: {
        id: string;
        name: string;
        description: string;
        icon: React.ElementType;
      }[];
    }[]
  >([]);

  useEffect(() => {
    const fetchResources = async () => {
      dispatch(showLoader('fetching roadmap'));
      try {
        const response = await fetchData(
          'GET',
          `/roadMaps/mainConcepts/${careerId}`,
        );
        setRoadmap(response.data);
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
