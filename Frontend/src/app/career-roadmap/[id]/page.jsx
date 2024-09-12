"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { useInView } from "react-intersection-observer";
import { FiCheckCircle } from "react-icons/fi";
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
          className="text-indigo-600"
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
      <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
        {completed}%
      </div>
    </div>
  );
};

const RoadmapStep = ({ title, description, icon: Icon, link }) => (
  <motion.div
    className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg flex items-start"
    variants={nodeVariants}
    whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <div className="mr-4">
      {Icon && <Icon className="text-indigo-600" size={24} />}
    </div>
    <div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h4>
      <p className="text-gray-700 dark:text-gray-300">{description}</p>
      {link && (
        <a
          href={link}
          className="text-indigo-600 dark:text-indigo-400 mt-2 inline-block"
        >
          Learn more
        </a>
      )}
    </div>
  </motion.div>
);

const RoadmapSection = ({ name, description }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const steps = [
    {
      title: "Step 1",
      description: "Description of step 1",
      icon: FiCheckCircle,
      link: "/step-1",
    },
    {
      title: "Step 2",
      description: "Description of step 2",
      icon: FiCheckCircle,
      link: "/step-2",
    },
  ];

  const completed = 50;

  return (
    <Parallax className="parallax-container" y={[20, -20]}>
      <motion.div
        className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {name}
          </h3>
          <ProgressCircle completed={completed} />
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
        <div className="roadmap-steps ml-6">
          {steps.map((step, index) => (
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
    <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <ParallaxProvider>
        <motion.div
          className="roadmap-content"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.4 }}
        >
          {roadmap.map((section) => (
            <RoadmapSection
              key={section.id}
              name={section.name}
              description={section.description}
            />
          ))}
        </motion.div>
      </ParallaxProvider>
    </div>
  );
}
