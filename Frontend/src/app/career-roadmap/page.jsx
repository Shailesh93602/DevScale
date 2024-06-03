"use client";
import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Parallax } from "react-scroll-parallax";
import ReactTooltip from "react-tooltip";
import { ParallaxProvider } from "react-scroll-parallax";
import "./roadmap.css";

const roadmapData = {
  title: "Full Stack Development with Next.js, Nest.js, MySQL",
  sections: [
    {
      title: "Basics of Web Development",
      steps: [
        { title: "HTML Basics", description: "Learn HTML basics." },
        { title: "CSS Basics", description: "Learn CSS basics." },
        { title: "JavaScript Basics", description: "Learn JavaScript basics." },
        { title: "Understanding HTTP", description: "Learn about HTTP." },
        {
          title: "Understanding Client-Server Architecture",
          description: "Learn about client-server architecture.",
        },
        {
          title: "Version Control with Git",
          description: "Learn Git for version control.",
        },
      ],
    },
    {
      title: "Fundamentals of Database",
      steps: [
        {
          title: "Basics of Relational Databases",
          description: "Learn about relational databases.",
        },
        { title: "SQL Basics", description: "Learn SQL basics." },
        { title: "MySQL Database", description: "Learn about MySQL." },
        {
          title: "Data Modeling and Design",
          description: "Learn data modeling and design.",
        },
        { title: "Normalization", description: "Learn about normalization." },
        {
          title: "Database Transactions",
          description: "Learn about database transactions.",
        },
      ],
    },
    {
      title: "Introduction to Node.js",
      steps: [
        { title: "Node.js Fundamentals" },
        { title: "Understanding Asynchronous Programming" },
        { title: "Working with File System in Node.js" },
        { title: "Node.js Modules" },
        { title: "Building a HTTP Server with Node.js" },
        { title: "Error Handling in Node.js" },
      ],
    },
    {
      title: "Backend Development with Nest.js",
      steps: [
        { title: "Introduction to Nest.js" },
        { title: "Understanding Typescript" },
        { title: "Nest.js Modules, Controllers, Services" },
        { title: "Building REST API with Nest.js" },
        { title: "Data Validation and Serialization" },
        { title: "Error Handling in Nest.js" },
      ],
    },
    {
      title: "Frontend Development with Next.js",
      steps: [
        { title: "Introduction to Next.js" },
        { title: "React Basics" },
        { title: "Next.js Routing" },
        { title: "Server-Side Rendering with Next.js" },
        { title: "Styling in Next.js" },
        { title: "Building a Frontend Application with Next.js" },
      ],
    },
    {
      title: "Integration of Next.js and Nest.js",
      steps: [
        { title: "Setup and Configuration" },
        { title: "Implementation of Client-Server Communication" },
        { title: "Handling Authentication" },
        { title: "Cross-Origin Resource Sharing (CORS)" },
        { title: "Deployment Strategies" },
      ],
    },
    {
      title: "Working with MySQL in Nest.js",
      steps: [
        { title: "MySQL Database Connection" },
        { title: "Create, Read, Update, Delete (CRUD) Operations" },
        { title: "Data Validation" },
        { title: "Handling Database Errors" },
      ],
    },
    {
      title: "State Management in Next.js",
      steps: [
        { title: "Understanding State Management" },
        { title: "Introduction to Redux" },
        { title: "Building a Redux Store" },
        { title: "Redux Middleware" },
        { title: "Asynchronous Actions in Redux" },
        { title: "Redux DevTools" },
      ],
    },
    {
      title: "Testing in Full Stack Development",
      steps: [
        { title: "Introduction to Testing" },
        { title: "Unit Testing in Nest.js" },
        { title: "Unit Testing in Next.js" },
        { title: "Integration Testing" },
        { title: "End-to-End Testing" },
        { title: "Best Practices in Testing" },
      ],
    },
    {
      title: "Deployment and DevOps",
      steps: [
        { title: "Basics of Hosting" },
        { title: "Continuous Integration (CI) and Continuous Deployment (CD)" },
        { title: "Docker Basics" },
        { title: "Kubernetes Basics" },
        { title: "CI/CD with Jenkins" },
        { title: "Cloud Hosting Providers (AWS, Google Cloud, Azure)" },
      ],
    },
    {
      title: "Performance Optimization",
      steps: [
        { title: "Basics of Performance Optimization" },
        { title: "Webpack and Babel" },
        { title: "Frontend Performance Optimization" },
        { title: "Backend Performance Optimization" },
        { title: "Database Performance Optimization" },
        { title: "Network Performance Optimization" },
      ],
    },
    {
      title: "Business and Legal",
      steps: [
        { title: "Understanding Business Basics" },
        { title: "Intellectual Property Rights" },
        { title: "Privacy and Data Protection Laws" },
        { title: "Accessibility and Compliance" },
        { title: "Security Laws" },
        { title: "Ethics in IT" },
      ],
    },
    {
      title: "Advanced Topics",
      steps: [
        { title: "Microservices Architecture" },
        { title: "Real-Time Applications with Websockets" },
        { title: "GraphQL" },
        { title: "Progressive Web App (PWA)" },
        { title: "Serverless Architecture" },
        { title: "Scalability and Availability" },
      ],
    },
  ],
};

// const nodeVariants = {
//   hidden: { opacity: 0, y: 20, scale: 0.8 },
//   visible: { opacity: 1, y: 0, scale: 1 },
// };

// const RoadmapStep = ({ title, description }) => {
//     return (
//       <motion.div
//       className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
//       variants={nodeVariants}
//       whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
//       transition={{ duration: 0.3 }}
//     >
//       <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h4>
//       <p className="text-gray-700 dark:text-gray-300">{description}</p>
//     </motion.div>
//     );
//   };

// const RoadmapSection = ({ title, steps }) => {
//   const controls = useAnimation();
//   const ref = useRef();

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           controls.start("visible");
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (ref.current) {
//       observer.observe(ref.current);
//     }

//     return () => {
//       if (ref.current) {
//         observer.unobserve(ref.current);
//       }
//     };
//   }, [controls]);

//   return (
//     <motion.div
//       className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
//       initial="hidden"
//       animate={controls}
//       variants={nodeVariants}
//       transition={{ staggerChildren: 0.2, delayChildren: 0.5 }}
//       ref={ref}
//     >
//       <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
//       <div className="roadmap-steps ml-6">
//         {steps.map((step, index) => (
//           <RoadmapStep key={index} {...step} />
//         ))}
//       </div>
//     </motion.div>
//   );
//   };

// const Roadmap = () => {
//   return (
//     <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
//         {roadmapData.title}
//       </h1>
//       <motion.div
//         className="roadmap-content"
//         initial="hidden"
//         animate="visible"
//         transition={{ staggerChildren: 0.4 }}
//       >
//         {roadmapData.sections.map((section, index) => (
//           <RoadmapSection key={index} {...section} />
//         ))}
//       </motion.div>
//     </div>
//   );
// };

const nodeVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 100, rotateX: 90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// const RoadmapStep = ({ title, description }) => (
//   <motion.div
//     className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
//     variants={nodeVariants}
//     whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
//     transition={{ duration: 0.3 }}
//   >
//     <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h4>
//     <p className="text-gray-700 dark:text-gray-300">{description}</p>
//   </motion.div>
// );

// const RoadmapSection = ({ title, steps }) => {
//   const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

//   return (
//     <motion.div
//       className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
//       ref={ref}
//       initial="hidden"
//       animate={inView ? "visible" : "hidden"}
//       variants={sectionVariants}
//     >
//       <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
//       <div className="roadmap-steps ml-6">
//         {steps.map((step, index) => (
//           <RoadmapStep key={index} {...step} />
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// const Roadmap = () => (
//   <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//     <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
//       {roadmapData.title}
//     </h1>
//     <motion.div
//       className="roadmap-content"
//       initial="hidden"
//       animate="visible"
//       transition={{ staggerChildren: 0.4 }}
//     >
//       {roadmapData.sections.map((section, index) => (
//         <RoadmapSection key={index} {...section} />
//       ))}
//     </motion.div>
//   </div>
// );

const RoadmapStep = ({ title, description }) => (
  <motion.div
    className="roadmap-step bg-white p-4 m-2 rounded shadow-lg"
    variants={nodeVariants}
    whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
    <p className="text-gray-700 dark:text-gray-300">{description}</p>
  </motion.div>
);

const RoadmapSection = ({ title, steps }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <Parallax className="parallax-container" y={[20, -20]}>
      <motion.div
        className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="roadmap-steps ml-6">
          {steps.map((step, index) => (
            <RoadmapStep key={index} {...step} />
          ))}
        </div>
      </motion.div>
    </Parallax>
  );
};

const Roadmap = () => (
  <ParallaxProvider>
    <div className="roadmap-container p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
        {roadmapData.title}
      </h1>
      <motion.div
        className="roadmap-content"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.4 }}
      >
        {roadmapData.sections.map((section, index) => (
          <RoadmapSection key={index} {...section} />
        ))}
      </motion.div>
    </div>
  </ParallaxProvider>
);

export default Roadmap;
