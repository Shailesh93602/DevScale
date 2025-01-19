"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ParallaxProvider } from "react-scroll-parallax";
import { useParams } from "next/navigation";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchData } from "@/app/services/fetchData";
import { RoadmapSection } from "./components/RoadmapSection";
import { Timeline } from "./components/Timeline";

export default function CareerPathPage() {
  const params = useParams();
  const careerId = params?.id || "";
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
      dispatch(showLoader());
      try {
        const response = await fetchData(
          "GET",
          `/roadMaps/mainConcepts/${careerId}`
        );
        setRoadmap(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching resources. Please try again");
      }
      dispatch(hideLoader());
    };
    fetchResources();
  }, [careerId, dispatch]);

  return (
    <div className="p-6 bg-bgColor min-h-screen">
      <ParallaxProvider>
        <motion.div
          className="roadmap-content max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-primary mb-8 text-center">
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
