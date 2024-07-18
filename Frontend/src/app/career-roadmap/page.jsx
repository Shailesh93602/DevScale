// "use client";
// // import React, { useEffect, useRef } from "react";
// // import { motion, useAnimation } from "framer-motion";
// // import { useInView } from "react-intersection-observer";
// // import { Parallax } from "react-scroll-parallax";
// // import ReactTooltip from "react-tooltip";
// // import { ParallaxProvider } from "react-scroll-parallax";
// // import "./roadmap.css";

// const roadmapData = {
//   title: "Full Stack Development with Next.js, Nest.js, MySQL",
//   sections: [
//     {
//       title: "Basics of Web Development",
//       steps: [
//         { title: "HTML Basics", description: "Learn HTML basics." },
//         { title: "CSS Basics", description: "Learn CSS basics." },
//         { title: "JavaScript Basics", description: "Learn JavaScript basics." },
//         { title: "Understanding HTTP", description: "Learn about HTTP." },
//         {
//           title: "Understanding Client-Server Architecture",
//           description: "Learn about client-server architecture.",
//         },
//         {
//           title: "Version Control with Git",
//           description: "Learn Git for version control.",
//         },
//       ],
//     },
//     {
//       title: "Fundamentals of Database",
//       steps: [
//         {
//           title: "Basics of Relational Databases",
//           description: "Learn about relational databases.",
//         },
//         { title: "SQL Basics", description: "Learn SQL basics." },
//         { title: "MySQL Database", description: "Learn about MySQL." },
//         {
//           title: "Data Modeling and Design",
//           description: "Learn data modeling and design.",
//         },
//         { title: "Normalization", description: "Learn about normalization." },
//         {
//           title: "Database Transactions",
//           description: "Learn about database transactions.",
//         },
//       ],
//     },
//     {
//       title: "Introduction to Node.js",
//       steps: [
//         { title: "Node.js Fundamentals" },
//         { title: "Understanding Asynchronous Programming" },
//         { title: "Working with File System in Node.js" },
//         { title: "Node.js Modules" },
//         { title: "Building a HTTP Server with Node.js" },
//         { title: "Error Handling in Node.js" },
//       ],
//     },
//     {
//       title: "Backend Development with Nest.js",
//       steps: [
//         { title: "Introduction to Nest.js" },
//         { title: "Understanding Typescript" },
//         { title: "Nest.js Modules, Controllers, Services" },
//         { title: "Building REST API with Nest.js" },
//         { title: "Data Validation and Serialization" },
//         { title: "Error Handling in Nest.js" },
//       ],
//     },
//     {
//       title: "Frontend Development with Next.js",
//       steps: [
//         { title: "Introduction to Next.js" },
//         { title: "React Basics" },
//         { title: "Next.js Routing" },
//         { title: "Server-Side Rendering with Next.js" },
//         { title: "Styling in Next.js" },
//         { title: "Building a Frontend Application with Next.js" },
//       ],
//     },
//     {
//       title: "Integration of Next.js and Nest.js",
//       steps: [
//         { title: "Setup and Configuration" },
//         { title: "Implementation of Client-Server Communication" },
//         { title: "Handling Authentication" },
//         { title: "Cross-Origin Resource Sharing (CORS)" },
//         { title: "Deployment Strategies" },
//       ],
//     },
//     {
//       title: "Working with MySQL in Nest.js",
//       steps: [
//         { title: "MySQL Database Connection" },
//         { title: "Create, Read, Update, Delete (CRUD) Operations" },
//         { title: "Data Validation" },
//         { title: "Handling Database Errors" },
//       ],
//     },
//     {
//       title: "State Management in Next.js",
//       steps: [
//         { title: "Understanding State Management" },
//         { title: "Introduction to Redux" },
//         { title: "Building a Redux Store" },
//         { title: "Redux Middleware" },
//         { title: "Asynchronous Actions in Redux" },
//         { title: "Redux DevTools" },
//       ],
//     },
//     {
//       title: "Testing in Full Stack Development",
//       steps: [
//         { title: "Introduction to Testing" },
//         { title: "Unit Testing in Nest.js" },
//         { title: "Unit Testing in Next.js" },
//         { title: "Integration Testing" },
//         { title: "End-to-End Testing" },
//         { title: "Best Practices in Testing" },
//       ],
//     },
//     {
//       title: "Deployment and DevOps",
//       steps: [
//         { title: "Basics of Hosting" },
//         { title: "Continuous Integration (CI) and Continuous Deployment (CD)" },
//         { title: "Docker Basics" },
//         { title: "Kubernetes Basics" },
//         { title: "CI/CD with Jenkins" },
//         { title: "Cloud Hosting Providers (AWS, Google Cloud, Azure)" },
//       ],
//     },
//     {
//       title: "Performance Optimization",
//       steps: [
//         { title: "Basics of Performance Optimization" },
//         { title: "Webpack and Babel" },
//         { title: "Frontend Performance Optimization" },
//         { title: "Backend Performance Optimization" },
//         { title: "Database Performance Optimization" },
//         { title: "Network Performance Optimization" },
//       ],
//     },
//     {
//       title: "Business and Legal",
//       steps: [
//         { title: "Understanding Business Basics" },
//         { title: "Intellectual Property Rights" },
//         { title: "Privacy and Data Protection Laws" },
//         { title: "Accessibility and Compliance" },
//         { title: "Security Laws" },
//         { title: "Ethics in IT" },
//       ],
//     },
//     {
//       title: "Advanced Topics",
//       steps: [
//         { title: "Microservices Architecture" },
//         { title: "Real-Time Applications with Websockets" },
//         { title: "GraphQL" },
//         { title: "Progressive Web App (PWA)" },
//         { title: "Serverless Architecture" },
//         { title: "Scalability and Availability" },
//       ],
//     },
//   ],
// };

// // const nodeVariants = {
// //   hidden: { opacity: 0, y: 20, scale: 0.8 },
// //   visible: { opacity: 1, y: 0, scale: 1 },
// // };

// // const RoadmapStep = ({ title, description }) => {
// //     return (
// //       <motion.div
// //       className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
// //       variants={nodeVariants}
// //       whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
// //       transition={{ duration: 0.3 }}
// //     >
// //       <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h4>
// //       <p className="text-gray-700 dark:text-gray-300">{description}</p>
// //     </motion.div>
// //     );
// //   };

// // const RoadmapSection = ({ title, steps }) => {
// //   const controls = useAnimation();
// //   const ref = useRef();

// //   useEffect(() => {
// //     const observer = new IntersectionObserver(
// //       ([entry]) => {
// //         if (entry.isIntersecting) {
// //           controls.start("visible");
// //         }
// //       },
// //       { threshold: 0.1 }
// //     );

// //     if (ref.current) {
// //       observer.observe(ref.current);
// //     }

// //     return () => {
// //       if (ref.current) {
// //         observer.unobserve(ref.current);
// //       }
// //     };
// //   }, [controls]);

// //   return (
// //     <motion.div
// //       className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
// //       initial="hidden"
// //       animate={controls}
// //       variants={nodeVariants}
// //       transition={{ staggerChildren: 0.2, delayChildren: 0.5 }}
// //       ref={ref}
// //     >
// //       <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
// //       <div className="roadmap-steps ml-6">
// //         {steps.map((step, index) => (
// //           <RoadmapStep key={index} {...step} />
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// //   };

// // const Roadmap = () => {
// //   return (
// //     <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
// //       <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
// //         {roadmapData.title}
// //       </h1>
// //       <motion.div
// //         className="roadmap-content"
// //         initial="hidden"
// //         animate="visible"
// //         transition={{ staggerChildren: 0.4 }}
// //       >
// //         {roadmapData.sections.map((section, index) => (
// //           <RoadmapSection key={index} {...section} />
// //         ))}
// //       </motion.div>
// //     </div>
// //   );
// // };

// // const nodeVariants = {
// //   hidden: { opacity: 0, y: 50, scale: 0.8 },
// //   visible: {
// //     opacity: 1,
// //     y: 0,
// //     scale: 1,
// //     transition: { duration: 0.6, ease: "easeOut" },
// //   },
// // };

// // const sectionVariants = {
// //   hidden: { opacity: 0, y: 100, rotateX: 90 },
// //   visible: {
// //     opacity: 1,
// //     y: 0,
// //     rotateX: 0,
// //     transition: { duration: 0.8, ease: "easeOut" },
// //   },
// // };

// // const RoadmapStep = ({ title, description }) => (
// //   <motion.div
// //     className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
// //     variants={nodeVariants}
// //     whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
// //     transition={{ duration: 0.3 }}
// //   >
// //     <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h4>
// //     <p className="text-gray-700 dark:text-gray-300">{description}</p>
// //   </motion.div>
// // );

// // const RoadmapSection = ({ title, steps }) => {
// //   const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

// //   return (
// //     <motion.div
// //       className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
// //       ref={ref}
// //       initial="hidden"
// //       animate={inView ? "visible" : "hidden"}
// //       variants={sectionVariants}
// //     >
// //       <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
// //       <div className="roadmap-steps ml-6">
// //         {steps.map((step, index) => (
// //           <RoadmapStep key={index} {...step} />
// //         ))}
// //       </div>
// //     </motion.div>
// //   );
// // };

// // const Roadmap = () => (
// //   <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
// //     <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
// //       {roadmapData.title}
// //     </h1>
// //     <motion.div
// //       className="roadmap-content"
// //       initial="hidden"
// //       animate="visible"
// //       transition={{ staggerChildren: 0.4 }}
// //     >
// //       {roadmapData.sections.map((section, index) => (
// //         <RoadmapSection key={index} {...section} />
// //       ))}
// //     </motion.div>
// //   </div>
// // );

// // const RoadmapStep = ({ title, description }) => (
// //   <motion.div
// //     className="roadmap-step bg-white p-4 m-2 rounded shadow-lg"
// //     variants={nodeVariants}
// //     whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
// //     transition={{ duration: 0.3 }}
// //   >
// //     <h4 className="text-lg font-bold text-gray-900">{title}</h4>
// //     <p className="text-gray-700 dark:text-gray-300">{description}</p>
// //   </motion.div>
// // );

// // const RoadmapSection = ({ title, steps }) => {
// //   const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

// //   return (
// //     <Parallax className="parallax-container" y={[20, -20]}>
// //       <motion.div
// //         className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
// //         ref={ref}
// //         initial="hidden"
// //         animate={inView ? "visible" : "hidden"}
// //         variants={sectionVariants}
// //       >
// //         <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
// //         <div className="roadmap-steps ml-6">
// //           {steps.map((step, index) => (
// //             <RoadmapStep key={index} {...step} />
// //           ))}
// //         </div>
// //       </motion.div>
// //     </Parallax>
// //   );
// // };

// // const Roadmap = () => (
// //   <ParallaxProvider>
// //     <div className="roadmap-container p-6 bg-gray-100 min-h-screen">
// //       <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
// //         {roadmapData.title}
// //       </h1>
// //       <motion.div
// //         className="roadmap-content"
// //         initial="hidden"
// //         animate="visible"
// //         transition={{ staggerChildren: 0.4 }}
// //       >
// //         {roadmapData.sections.map((section, index) => (
// //           <RoadmapSection key={index} {...section} />
// //         ))}
// //       </motion.div>
// //     </div>
// //   </ParallaxProvider>
// // );

// // export default Roadmap;

// // ("use client");
// import React from "react";
// import { motion } from "framer-motion";
// import { Parallax, ParallaxProvider } from "react-scroll-parallax";
// import { useInView } from "react-intersection-observer";
// import { FiCheckCircle } from "react-icons/fi";

// const nodeVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// const sectionVariants = {
//   hidden: { opacity: 0, scale: 0.9 },
//   visible: { opacity: 1, scale: 1 },
// };

// const ProgressCircle = ({ completed }) => {
//   const radius = 28;
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (completed / 100) * circumference;

//   return (
//     <div className="relative mt-4 w-16 h-16">
//       <svg className="absolute inset-0 w-full h-full transform -rotate-90">
//         <circle
//           className="text-gray-300"
//           strokeWidth="4"
//           stroke="currentColor"
//           fill="transparent"
//           r={radius}
//           cx="50%"
//           cy="50%"
//         />
//         <circle
//           className="text-indigo-600"
//           strokeWidth="4"
//           strokeDasharray={circumference}
//           strokeDashoffset={offset}
//           strokeLinecap="round"
//           stroke="currentColor"
//           fill="transparent"
//           r={radius}
//           cx="50%"
//           cy="50%"
//         />
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
//         {completed}%
//       </div>
//     </div>
//   );
// };

// const RoadmapStep = ({ title, description, icon: Icon, link }) => (
//   <motion.div
//     className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg flex items-start"
//     variants={nodeVariants}
//     whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
//     transition={{ duration: 0.3 }}
//   >
//     <div className="mr-4">
//       {Icon && <Icon className="text-indigo-600" size={24} />}
//     </div>
//     <div>
//       <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
//         {title}
//       </h4>
//       <p className="text-gray-700 dark:text-gray-300">{description}</p>
//       {link && (
//         <a
//           href={link}
//           className="text-indigo-600 dark:text-indigo-400 mt-2 inline-block"
//         >
//           Learn more
//         </a>
//       )}
//     </div>
//   </motion.div>
// );

// const RoadmapSection = ({ title, steps, completed }) => {
//   const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

//   return (
//     <Parallax className="parallax-container" y={[20, -20]}>
//       <motion.div
//         className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
//         ref={ref}
//         initial="hidden"
//         animate={inView ? "visible" : "hidden"}
//         variants={sectionVariants}
//       >
//         <div className="flex justify-between items-center">
//           <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//             {title}
//           </h3>
//           <ProgressCircle completed={completed} />
//         </div>
//         <div className="roadmap-steps ml-6">
//           {steps.map((step, index) => (
//             <RoadmapStep key={index} {...step} />
//           ))}
//         </div>
//       </motion.div>
//     </Parallax>
//   );
// };

// // const roadmapData = {
// //   title: "Full Stack Development Roadmap",
// //   sections: [
// //     {
// //       title: "Basics of Web Development",
// //       steps: [
// //         {
// //           title: "HTML",
// //           description: "Learn the basics of HTML.",
// //           icon: FiCheckCircle,
// //           link: "/html-resources",
// //         },
// //         {
// //           title: "CSS",
// //           description: "Learn the basics of CSS.",
// //           icon: FiCheckCircle,
// //           link: "/css-resources",
// //         },
// //         {
// //           title: "JavaScript",
// //           description: "Learn the basics of JavaScript.",
// //           icon: FiCheckCircle,
// //           link: "/javascript-resources",
// //         },
// //       ],
// //       completed: 40,
// //     },
// //     {
// //       title: "Frontend Frameworks",
// //       steps: [
// //         {
// //           title: "React",
// //           description: "Learn the basics of React.",
// //           icon: FiCheckCircle,
// //           link: "/react-resources",
// //         },
// //         {
// //           title: "Vue",
// //           description: "Learn the basics of Vue.",
// //           icon: FiCheckCircle,
// //           link: "/vue-resources",
// //         },
// //         {
// //           title: "Angular",
// //           description: "Learn the basics of Angular.",
// //           icon: FiCheckCircle,
// //           link: "/angular-resources",
// //         },
// //       ],
// //       completed: 25,
// //     },
// //     // Add more sections as needed
// //   ],
// // };

// const Roadmap = () => (
//   <ParallaxProvider>
//     <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
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
//   </ParallaxProvider>
// );

// export default Roadmap;

"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { useInView } from "react-intersection-observer";
import { FiCheckCircle } from "react-icons/fi";

import { useRouter } from "next/navigation";

// Variants for animations
const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Progress Circle Component
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

// Roadmap Step Component
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

// Roadmap Section Component
const RoadmapSection = ({ title, steps, completed }) => {
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
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
          <ProgressCircle completed={completed} />
        </div>
        <div className="roadmap-steps ml-6">
          {steps.map((step, index) => (
            <RoadmapStep key={index} {...step} />
          ))}
        </div>
      </motion.div>
    </Parallax>
  );
};

// Sample roadmap data
const roadmapData = {
  title: "Full Stack Development with Next.js, Nest.js, MySQL",
  sections: [
    {
      title: "Basics of Web Development",
      steps: [
        {
          title: "HTML Basics",
          description: "Learn HTML basics.",
          icon: FiCheckCircle,
          link: "/html-basics",
        },
        {
          title: "CSS Basics",
          description: "Learn CSS basics.",
          icon: FiCheckCircle,
          link: "/css-basics",
        },
        {
          title: "JavaScript Basics",
          description: "Learn JavaScript basics.",
          icon: FiCheckCircle,
          link: "/javascript-basics",
        },
        {
          title: "Understanding HTTP",
          description: "Learn about HTTP.",
          icon: FiCheckCircle,
          link: "/http",
        },
        {
          title: "Understanding Client-Server Architecture",
          description: "Learn about client-server architecture.",
          icon: FiCheckCircle,
          link: "/client-server-architecture",
        },
        {
          title: "Version Control with Git",
          description: "Learn Git for version control.",
          icon: FiCheckCircle,
          link: "/git",
        },
      ],
      completed: 50,
    },
    {
      title: "Fundamentals of Database",
      steps: [
        {
          title: "Basics of Relational Databases",
          description: "Learn about relational databases.",
          icon: FiCheckCircle,
          link: "/relational-databases",
        },
        {
          title: "SQL Basics",
          description: "Learn SQL basics.",
          icon: FiCheckCircle,
          link: "/sql-basics",
        },
        {
          title: "MySQL Database",
          description: "Learn about MySQL.",
          icon: FiCheckCircle,
          link: "/mysql",
        },
        {
          title: "Data Modeling and Design",
          description: "Learn data modeling and design.",
          icon: FiCheckCircle,
          link: "/data-modeling",
        },
        {
          title: "Normalization",
          description: "Learn about normalization.",
          icon: FiCheckCircle,
          link: "/normalization",
        },
        {
          title: "Database Transactions",
          description: "Learn about database transactions.",
          icon: FiCheckCircle,
          link: "/database-transactions",
        },
      ],
      completed: 40,
    },
    {
      title: "Introduction to Node.js",
      steps: [
        {
          title: "Node.js Fundamentals",
          description: "Learn Node.js fundamentals.",
          icon: FiCheckCircle,
          link: "/nodejs-fundamentals",
        },
        {
          title: "Understanding Asynchronous Programming",
          description: "Learn about asynchronous programming.",
          icon: FiCheckCircle,
          link: "/async-programming",
        },
        {
          title: "Working with File System in Node.js",
          description: "Learn to work with the file system in Node.js.",
          icon: FiCheckCircle,
          link: "/nodejs-filesystem",
        },
        {
          title: "Node.js Modules",
          description: "Learn about Node.js modules.",
          icon: FiCheckCircle,
          link: "/nodejs-modules",
        },
        {
          title: "Building a HTTP Server with Node.js",
          description: "Learn to build an HTTP server with Node.js.",
          icon: FiCheckCircle,
          link: "/nodejs-http-server",
        },
        {
          title: "Error Handling in Node.js",
          description: "Learn about error handling in Node.js.",
          icon: FiCheckCircle,
          link: "/nodejs-error-handling",
        },
      ],
      completed: 30,
    },
    {
      title: "Backend Development with Nest.js",
      steps: [
        {
          title: "Introduction to Nest.js",
          description: "Learn about Nest.js.",
          icon: FiCheckCircle,
          link: "/nestjs-intro",
        },
        {
          title: "Understanding Typescript",
          description: "Learn about Typescript.",
          icon: FiCheckCircle,
          link: "/typescript",
        },
        {
          title: "Nest.js Modules, Controllers, Services",
          description:
            "Learn about Nest.js modules, controllers, and services.",
          icon: FiCheckCircle,
          link: "/nestjs-modules",
        },
        {
          title: "Building REST API with Nest.js",
          description: "Learn to build a REST API with Nest.js.",
          icon: FiCheckCircle,
          link: "/nestjs-rest-api",
        },
        {
          title: "Data Validation and Serialization",
          description:
            "Learn about data validation and serialization in Nest.js.",
          icon: FiCheckCircle,
          link: "/nestjs-validation",
        },
        {
          title: "Error Handling in Nest.js",
          description: "Learn about error handling in Nest.js.",
          icon: FiCheckCircle,
          link: "/nestjs-error-handling",
        },
      ],
      completed: 20,
    },
    {
      title: "Frontend Development with Next.js",
      steps: [
        {
          title: "Introduction to Next.js",
          description: "Learn about Next.js.",
          icon: FiCheckCircle,
          link: "/nextjs-intro",
        },
        {
          title: "React Basics",
          description: "Learn React basics.",
          icon: FiCheckCircle,
          link: "/react-basics",
        },
        {
          title: "Next.js Routing",
          description: "Learn about Next.js routing.",
          icon: FiCheckCircle,
          link: "/nextjs-routing",
        },
        {
          title: "Server-Side Rendering with Next.js",
          description: "Learn about server-side rendering with Next.js.",
          icon: FiCheckCircle,
          link: "/nextjs-ssr",
        },
        {
          title: "Styling in Next.js",
          description: "Learn about styling in Next.js.",
          icon: FiCheckCircle,
          link: "/nextjs-styling",
        },
        {
          title: "Building a Frontend Application with Next.js",
          description: "Learn to build a frontend application with Next.js.",
          icon: FiCheckCircle,
          link: "/nextjs-frontend",
        },
      ],
      completed: 25,
    },
    {
      title: "Integration of Next.js and Nest.js",
      steps: [
        {
          title: "Setup and Configuration",
          description: "Learn about setup and configuration.",
          icon: FiCheckCircle,
          link: "/integration-setup",
        },
        {
          title: "Implementation of Client-Server Communication",
          description: "Learn about client-server communication.",
          icon: FiCheckCircle,
          link: "/client-server-communication",
        },
        {
          title: "Handling Authentication",
          description: "Learn about handling authentication.",
          icon: FiCheckCircle,
          link: "/authentication",
        },
        {
          title: "Cross-Origin Resource Sharing (CORS)",
          description: "Learn about CORS.",
          icon: FiCheckCircle,
          link: "/cors",
        },
        {
          title: "Deployment Strategies",
          description: "Learn about deployment strategies.",
          icon: FiCheckCircle,
          link: "/deployment-strategies",
        },
      ],
      completed: 15,
    },
    {
      title: "Working with MySQL in Nest.js",
      steps: [
        {
          title: "MySQL Database Connection",
          description: "Learn about MySQL database connection.",
          icon: FiCheckCircle,
          link: "/mysql-connection",
        },
        {
          title: "Create, Read, Update, Delete (CRUD) Operations",
          description: "Learn about CRUD operations.",
          icon: FiCheckCircle,
          link: "/crud-operations",
        },
        {
          title: "Data Validation",
          description: "Learn about data validation.",
          icon: FiCheckCircle,
          link: "/data-validation",
        },
        {
          title: "Handling Database Errors",
          description: "Learn about handling database errors.",
          icon: FiCheckCircle,
          link: "/database-errors",
        },
      ],
      completed: 35,
    },
    {
      title: "State Management in Next.js",
      steps: [
        {
          title: "Understanding State Management",
          description: "Learn about state management.",
          icon: FiCheckCircle,
          link: "/state-management",
        },
        {
          title: "Introduction to Redux",
          description: "Learn about Redux.",
          icon: FiCheckCircle,
          link: "/redux-intro",
        },
        {
          title: "Building a Redux Store",
          description: "Learn to build a Redux store.",
          icon: FiCheckCircle,
          link: "/redux-store",
        },
        {
          title: "Redux Middleware",
          description: "Learn about Redux middleware.",
          icon: FiCheckCircle,
          link: "/redux-middleware",
        },
        {
          title: "Asynchronous Actions in Redux",
          description: "Learn about asynchronous actions in Redux.",
          icon: FiCheckCircle,
          link: "/redux-async-actions",
        },
        {
          title: "Redux DevTools",
          description: "Learn about Redux DevTools.",
          icon: FiCheckCircle,
          link: "/redux-devtools",
        },
      ],
      completed: 45,
    },
    {
      title: "Testing in Full Stack Development",
      steps: [
        {
          title: "Introduction to Testing",
          description: "Learn about testing.",
          icon: FiCheckCircle,
          link: "/testing-intro",
        },
        {
          title: "Unit Testing in Nest.js",
          description: "Learn about unit testing in Nest.js.",
          icon: FiCheckCircle,
          link: "/nestjs-unit-testing",
        },
        {
          title: "Unit Testing in Next.js",
          description: "Learn about unit testing in Next.js.",
          icon: FiCheckCircle,
          link: "/nextjs-unit-testing",
        },
        {
          title: "Integration Testing",
          description: "Learn about integration testing.",
          icon: FiCheckCircle,
          link: "/integration-testing",
        },
        {
          title: "End-to-End Testing",
          description: "Learn about end-to-end testing.",
          icon: FiCheckCircle,
          link: "/e2e-testing",
        },
        {
          title: "Best Practices in Testing",
          description: "Learn about best practices in testing.",
          icon: FiCheckCircle,
          link: "/testing-best-practices",
        },
      ],
      completed: 50,
    },
    {
      title: "Deployment and DevOps",
      steps: [
        {
          title: "Basics of Hosting",
          description: "Learn about hosting basics.",
          icon: FiCheckCircle,
          link: "/hosting-basics",
        },
        {
          title: "Continuous Integration (CI) and Continuous Deployment (CD)",
          description: "Learn about CI/CD.",
          icon: FiCheckCircle,
          link: "/ci-cd",
        },
        {
          title: "Docker Basics",
          description: "Learn about Docker basics.",
          icon: FiCheckCircle,
          link: "/docker-basics",
        },
        {
          title: "Kubernetes Basics",
          description: "Learn about Kubernetes basics.",
          icon: FiCheckCircle,
          link: "/kubernetes-basics",
        },
        {
          title: "CI/CD with Jenkins",
          description: "Learn about CI/CD with Jenkins.",
          icon: FiCheckCircle,
          link: "/ci-cd-jenkins",
        },
        {
          title: "Cloud Hosting Providers (AWS, Google Cloud, Azure)",
          description: "Learn about cloud hosting providers.",
          icon: FiCheckCircle,
          link: "/cloud-hosting",
        },
      ],
      completed: 50,
    },
    {
      title: "Performance Optimization",
      steps: [
        {
          title: "Basics of Performance Optimization",
          description: "Learn about performance optimization basics.",
          icon: FiCheckCircle,
          link: "/performance-optimization-basics",
        },
        {
          title: "Webpack and Babel",
          description: "Learn about Webpack and Babel.",
          icon: FiCheckCircle,
          link: "/webpack-babel",
        },
        {
          title: "Frontend Performance Optimization",
          description: "Learn about frontend performance optimization.",
          icon: FiCheckCircle,
          link: "/frontend-performance",
        },
        {
          title: "Backend Performance Optimization",
          description: "Learn about backend performance optimization.",
          icon: FiCheckCircle,
          link: "/backend-performance",
        },
        {
          title: "Database Performance Optimization",
          description: "Learn about database performance optimization.",
          icon: FiCheckCircle,
          link: "/database-performance",
        },
        {
          title: "Network Performance Optimization",
          description: "Learn about network performance optimization.",
          icon: FiCheckCircle,
          link: "/network-performance",
        },
      ],
      completed: 30,
    },
    {
      title: "Business and Legal",
      steps: [
        {
          title: "Understanding Business Basics",
          description: "Learn about business basics.",
          icon: FiCheckCircle,
          link: "/business-basics",
        },
        {
          title: "Intellectual Property Rights",
          description: "Learn about intellectual property rights.",
          icon: FiCheckCircle,
          link: "/ip-rights",
        },
        {
          title: "Privacy and Data Protection Laws",
          description: "Learn about privacy and data protection laws.",
          icon: FiCheckCircle,
          link: "/data-protection",
        },
        {
          title: "Accessibility and Compliance",
          description: "Learn about accessibility and compliance.",
          icon: FiCheckCircle,
          link: "/accessibility-compliance",
        },
        {
          title: "Security Laws",
          description: "Learn about security laws.",
          icon: FiCheckCircle,
          link: "/security-laws",
        },
        {
          title: "Ethics in IT",
          description: "Learn about ethics in IT.",
          icon: FiCheckCircle,
          link: "/ethics",
        },
      ],
      completed: 20,
    },
    {
      title: "Advanced Topics",
      steps: [
        {
          title: "Microservices Architecture",
          description: "Learn about microservices architecture.",
          icon: FiCheckCircle,
          link: "/microservices",
        },
        {
          title: "Real-Time Applications with Websockets",
          description: "Learn about real-time applications with Websockets.",
          icon: FiCheckCircle,
          link: "/websockets",
        },
        {
          title: "GraphQL",
          description: "Learn about GraphQL.",
          icon: FiCheckCircle,
          link: "/graphql",
        },
        {
          title: "Progressive Web App (PWA)",
          description: "Learn about progressive web apps.",
          icon: FiCheckCircle,
          link: "/pwa",
        },
        {
          title: "Serverless Architecture",
          description: "Learn about serverless architecture.",
          icon: FiCheckCircle,
          link: "/serverless",
        },
        {
          title: "Scalability and Availability",
          description: "Learn about scalability and availability.",
          icon: FiCheckCircle,
          link: "/scalability",
        },
      ],
      completed: 10,
    },
  ],
};

const Roadmap = () => (
  <ParallaxProvider>
    <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
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

// import React from 'react';
// import { motion } from 'framer-motion';
// import { Parallax, ParallaxProvider } from 'react-scroll-parallax';
// import { FiCheckCircle } from 'react-icons/fi';

// const nodeVariants = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 }
// };

// const sectionVariants = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 }
// };

// const ProgressBar = ({ progress, totalSteps }) => {
//   const percentage = (progress / totalSteps) * 100;
//   return (
//     <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mb-4">
//       <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
//     </div>
//   );
// };

// const CurrentStep = ({ step }) => (
//   <motion.div
//     className="roadmap-step bg-white dark:bg-gray-700 p-4 m-2 rounded shadow-lg"
//     variants={nodeVariants}
//     whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
//     transition={{ duration: 0.3 }}
//   >
//     <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{step.title}</h4>
//     <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
//     <a href={step.link} className="text-blue-500 dark:text-blue-400 mt-2 inline-block">
//       Learn More
//     </a>
//     <button className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
//       Start Quiz
//     </button>
//   </motion.div>
// );

// const Roadmap = ({ data }) => (
//   <ParallaxProvider>
//     <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
//       <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
//         {data.title}
//       </h1>
//       <motion.div
//         className="roadmap-content"
//         initial="hidden"
//         animate="visible"
//         transition={{ staggerChildren: 0.4 }}
//       >
//         <Parallax className="parallax-container" y={[20, -20]}>
//           <motion.div
//             className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
//             initial="hidden"
//             animate="visible"
//             variants={sectionVariants}
//           >
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//               {data.currentSection.title}
//             </h3>
//             <ProgressBar progress={data.currentSection.progress} totalSteps={data.currentSection.totalSteps} />
//             <CurrentStep step={data.currentSection.currentStep} />
//           </motion.div>
//         </Parallax>
//       </motion.div>
//     </div>
//   </ParallaxProvider>
// );

// export default Roadmap;
