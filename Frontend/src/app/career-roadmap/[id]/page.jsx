"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { useInView } from "react-intersection-observer";
import { useParams } from "next/navigation";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchData } from "@/app/services/fetchData";

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const ProgressCircle = ({ completed }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <div className="relative mt-4 w-16 h-16">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          className="text-gray-300"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-primary"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-primary">
        {completed}%
      </div>
    </div>
  );
};

const RoadmapStep = ({ id, name, description, icon: Icon }) => (
  <motion.div
    className="bg-light p-4 m-2 rounded shadow-lg flex items-start"
    variants={nodeVariants}
    whileHover={{ scale: 1.04, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <div className="mr-4">
      {Icon && <Icon className="text-primary" size={24} />}
    </div>
    <div>
      <h4 className="text-lg font-bold">{name}</h4>
      <p className="text-grayText">{description}</p>
      {id && (
        <a
          href={`/resources/${id}`}
          target="_blank"
          className="text-primary hover:text-primary2 hover:underline mt-2 inline-block"
        >
          Learn more
        </a>
      )}
    </div>
  </motion.div>
);

const RoadmapSection = ({ name, description, subjects }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const completed = 50;

  return (
    <Parallax className="parallax-container" y={[20, -20]}>
      <motion.div
        className="p-6 m-4 bg-lightSecondary rounded-lg shadow-md"
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{name}</h3>
          <ProgressCircle completed={completed} />
        </div>
        <p className="mb-4">{description}</p>
        <div className="ml-6">
          {subjects?.map((step, index) => (
            <RoadmapStep key={index} {...step} />
          ))}
        </div>
      </motion.div>
    </Parallax>
  );
};

export default function CareerPathPage() {
  const params = useParams();
  const careerId = params?.id || "";
  const dispatch = useDispatch();

  const [roadmap, setRoadmap] = useState([]);

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
