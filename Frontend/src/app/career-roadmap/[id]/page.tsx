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
        console.log(
          "🚀 --------------------------------------------------------------🚀"
        );
        console.log(
          "🚀 ~ file: page.tsx:174 ~ fetchResources ~ response:",
          response
        );
        console.log(
          "🚀 --------------------------------------------------------------🚀"
        );
        setRoadmap(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching resources, Please try again");
      }
      dispatch(hideLoader());
    };
    fetchResources();
  }, [careerId, dispatch]);

  return (
    <div className="p-6">
      <ParallaxProvider>
        <motion.div
          className="roadmap-content"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.4 }}
        >
          {roadmap?.map((section) => (
            <RoadmapSection
              key={section.id}
              name={section.name}
              description={section.description}
              subjects={section.Subjects}
            />
          ))}
        </motion.div>
      </ParallaxProvider>
    </div>
  );
}
