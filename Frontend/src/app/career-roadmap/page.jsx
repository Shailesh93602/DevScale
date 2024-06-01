// import Link from 'next/link';

// export default function CareerRoadmap() {
//   return (
//     <main className="flex flex-col text-gray-900">
//       <section className="bg-gray-100 py-12 md:py-20 lg:py-28 text-gray-900">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
//                   Your Career Roadmap
//                 </h1>
//                 <p className="max-w-[600px] text-gray-500 md:text-xl">
//                   Get a personalized roadmap to guide you through your engineering journey, from skill development to landing your dream job.
//                 </p>
//               </div>
//               <div className="flex flex-col gap-2 min-[400px]:flex-row">
//                 <Link
//                   href="/get-roadmap"
//                   className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
//                 >
//                   Get Your Roadmap
//                 </Link>
//               </div>
//             </div>
//             <img
//               alt="Career Roadmap"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//               height="310"
//               src="/career-roadmap.svg"
//               width="550"
//             />
//           </div>
//         </div>
//       </section>
//       <section className="bg-light py-12 md:py-20 lg:py-28 tex-gray-900">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                   Skills to Develop
//                 </h2>
//                 <p className="max-w-[600px] text-gray-500 md:text-xl">
//                   Identify the key skills you need to master to advance in your career.
//                 </p>
//               </div>
//               <ul className="list-disc pl-5 space-y-2">
//                 <li className="text-gray-700">Programming Languages</li>
//                 <li className="text-gray-700">Frameworks and Libraries</li>
//                 <li className="text-gray-700">Soft Skills</li>
//                 <li className="text-gray-700">Project Management</li>
//               </ul>
//             </div>
//             <img
//               alt="Skills Development"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//               height="310"
//               src="/skills-development.svg"
//               width="550"
//             />
//           </div>
//         </div>
//       </section>
//       <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                   Recommended Courses
//                 </h2>
//                 <p className="max-w-[600px] text-gray-500 md:text-xl">
//                   Enroll in these courses to gain the knowledge and expertise required for your desired role.
//                 </p>
//               </div>
//               <ul className="list-disc pl-5 space-y-2">
//                 <li className="text-gray-700">Introduction to Programming</li>
//                 <li className="text-gray-700">Advanced Algorithms</li>
//                 <li className="text-gray-700">Data Structures</li>
//                 <li className="text-gray-700">Project Management</li>
//               </ul>
//             </div>
//             <img
//               alt="Recommended Courses"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//               height="310"
//               src="/recommended-courses.svg"
//               width="550"
//             />
//           </div>
//         </div>
//       </section>
//       <section className="bg-light py-12 md:py-20 lg:py-28">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                   Career Milestones
//                 </h2>
//                 <p className="max-w-[600px] text-gray-500 md:text-xl">
//                   Track your progress with these key career milestones.
//                 </p>
//               </div>
//               <ul className="list-disc pl-5 space-y-2">
//                 <li className="text-gray-700">First Internship</li>
//                 <li className="text-gray-700">First Full-time Job</li>
//                 <li className="text-gray-700">First Promotion</li>
//                 <li className="text-gray-700">Leadership Role</li>
//               </ul>
//             </div>
//             <img
//               alt="Career Milestones"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//               height="310"
//               src="/career-milestones.svg"
//               width="550"
//             />
//           </div>
//         </div>
//       </section>
//       <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                   Resources
//                 </h2>
//                 <p className="max-w-[600px] text-gray-500 md:text-xl">
//                   Access a curated list of resources to aid your career growth.
//                 </p>
//               </div>
//               <ul className="list-disc pl-5 space-y-2">
//                 <li className="text-gray-700">Books</li>
//                 <li className="text-gray-700">Websites</li>
//                 <li className="text-gray-700">Online Communities</li>
//                 <li className="text-gray-700">Mentorship Programs</li>
//               </ul>
//             </div>
//             <img
//               alt="Resources"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//               height="310"
//               src="/resources.svg"
//               width="550"
//             />
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// "use client";
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// const RoadmapItem = ({ title }) => {
//   return (
//     <motion.div
//       className="flex items-center py-4"
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <div className="h-6 w-6 rounded-full border-2 border-gray-300 mr-4 bg-gray-300" />
//       <div>
//         <h3 className="text-lg font-semibold">{title}</h3>
//       </div>
//     </motion.div>
//   );
// };

// const RoadmapSection = ({ title, steps }) => {
//   return (
//     <div className="my-8">
//       <h2 className="text-xl font-semibold mb-4">{title}</h2>
//       <div className="space-y-4">
//         {steps.map((step, index) => (
//           <RoadmapItem key={index} title={step.title} />
//         ))}
//       </div>
//     </div>
//   );
// };

// const RoadmapSection = ({ title, steps }) => {
//   const [expanded, setExpanded] = useState(false);

//   const handleToggleExpand = () => {
//     setExpanded(!expanded);
//   };

//   return (
//     <div className="my-8">
//       <motion.button
//         className="bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 focus:outline-none"
//         onClick={handleToggleExpand}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//       >
//         {title}
//       </motion.button>
//       {expanded && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <ul className="list-disc pl-8">
//             {steps.map((step, index) => (
//               <li key={index}>{step.title}</li>
//             ))}
//           </ul>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// const RoadmapNode = ({ title, subtopics, x, y }) => {
//   const variants = {
//     hidden: { opacity: 0, scale: 0 },
//     visible: { opacity: 1, scale: 1 },
//   };

//   return (
//     <>
//       <motion.button
//         className="bg-blue-500 text-white py-2 px-4 rounded-lg focus:outline-none"
//         initial="hidden"
//         animate="visible"
//         variants={variants}
//         style={{ x, y }}
//       >
//         {title}
//       </motion.button>
//       {subtopics && (
//         <>
//           {subtopics.map((subtopic, index) => (
//             <RoadmapNode
//               key={index}
//               title={subtopic.title}
//               subtopics={subtopic.subtopics}
//               x={x + (index - subtopics.length / 2) * 120}
//               y={y + 100}
//             />
//           ))}
//         </>
//       )}
//     </>
//   );
// };



// const Roadmap = () => {
//   const roadmap = {
//     "title": "Full Stack Development with Next.js, Nest.js, MySQL",
//     "sections": [
//         {
//             "title": "Basics of Web Development",
//             "steps": [
//                 {
//                     "title": "HTML Basics"
//                 },
//                 {
//                     "title": "CSS Basics"
//                 },
//                 {
//                     "title": "JavaScript Basics"
//                 },
//                 {
//                     "title": "Understanding HTTP"
//                 },
//                 {
//                     "title": "Understanding Client-Server Architecture"
//                 },
//                 {
//                     "title": "Version Control with Git"
//                 }
//             ]
//         },
//         {
//             "title": "Fundamentals of Database",
//             "steps": [
//                 {
//                     "title": "Basics of Relational Databases"
//                 },
//                 {
//                     "title": "SQL Basics"
//                 },
//                 {
//                     "title": "MySQL Database"
//                 },
//                 {
//                     "title": "Data Modeling and Design"
//                 },
//                 {
//                     "title": "Normalization"
//                 },
//                 {
//                     "title": "Database Transactions"
//                 }
//             ]
//         },
//         {
//             "title": "Introduction to Node.js",
//             "steps": [
//                 {
//                     "title": "Node.js Fundamentals"
//                 },
//                 {
//                     "title": "Understanding Asynchronous Programming"
//                 },
//                 {
//                     "title": "Working with File System in Node.js"
//                 },
//                 {
//                     "title": "Node.js Modules"
//                 },
//                 {
//                     "title": "Building a HTTP Server with Node.js"
//                 },
//                 {
//                     "title": "Error Handling in Node.js"
//                 }
//             ]
//         },
//         {
//             "title": "Backend Development with Nest.js",
//             "steps": [
//                 {
//                     "title": "Introduction to Nest.js"
//                 },
//                 {
//                     "title": "Understanding Typescript"
//                 },
//                 {
//                     "title": "Nest.js Modules, Controllers, Services"
//                 },
//                 {
//                     "title": "Building REST API with Nest.js"
//                 },
//                 {
//                     "title": "Data Validation and Serialization"
//                 },
//                 {
//                     "title": "Error Handling in Nest.js"
//                 }
//             ]
//         },
//         {
//             "title": "Frontend Development with Next.js",
//             "steps": [
//                 {
//                     "title": "Introduction to Next.js"
//                 },
//                 {
//                     "title": "React Basics"
//                 },
//                 {
//                     "title": "Next.js Routing"
//                 },
//                 {
//                     "title": "Server-Side Rendering with Next.js"
//                 },
//                 {
//                     "title": "Styling in Next.js"
//                 },
//                 {
//                     "title": "Building a Frontend Application with Next.js"
//                 }
//             ]
//         },
//         {
//             "title": "Integration of Next.js and Nest.js",
//             "steps": [
//                 {
//                     "title": "Setup and Configuration"
//                 },
//                 {
//                     "title": "Implementation of Client-Server Communication"
//                 },
//                 {
//                     "title": "Handling Authentication"
//                 },
//                 {
//                     "title": "Cross-Origin Resource Sharing (CORS)"
//                 },
//                 {
//                     "title": "Deployment Strategies"
//                 }
//             ]
//         },
//         {
//             "title": "Working with MySQL in Nest.js",
//             "steps": [
//                 {
//                     "title": "MySQL Database Connection"
//                 },
//                 {
//                     "title": "Create, Read, Update, Delete (CRUD) Operations"
//                 },
//                 {
//                     "title": "Data Validation"
//                 },
//                 {
//                     "title": "Handling Database Errors"
//                 }
//             ]
//         },
//         {
//             "title": "State Management in Next.js",
//             "steps": [
//                 {
//                     "title": "Understanding State Management"
//                 },
//                 {
//                     "title": "Introduction to Redux"
//                 },
//                 {
//                     "title": "Building a Redux Store"
//                 },
//                 {
//                     "title": "Redux Middleware"
//                 },
//                 {
//                     "title": "Asynchronous Actions in Redux"
//                 },
//                 {
//                     "title": "Redux DevTools"
//                 }
//             ]
//         },
//         {
//             "title": "Testing in Full Stack Development",
//             "steps": [
//                 {
//                     "title": "Introduction to Testing"
//                 },
//                 {
//                     "title": "Unit Testing in Nest.js"
//                 },
//                 {
//                     "title": "Unit Testing in Next.js"
//                 },
//                 {
//                     "title": "Integration Testing"
//                 },
//                 {
//                     "title": "End-to-End Testing"
//                 },
//                 {
//                     "title": "Best Practices in Testing"
//                 }
//             ]
//         },
//         {
//             "title": "Deployment and DevOps",
//             "steps": [
//                 {
//                     "title": "Basics of Hosting"
//                 },
//                 {
//                     "title": "Continuous Integration (CI) and Continuous Deployment (CD)"
//                 },
//                 {
//                     "title": "Docker Basics"
//                 },
//                 {
//                     "title": "Kubernetes Basics"
//                 },
//                 {
//                     "title": "CI/CD with Jenkins"
//                 },
//                 {
//                     "title": "Cloud Hosting Providers (AWS, Google Cloud, Azure)"
//                 }
//             ]
//         },
//         {
//             "title": "Performance Optimization",
//             "steps": [
//                 {
//                     "title": "Basics of Performance Optimization"
//                 },
//                 {
//                     "title": "Webpack and Babel"
//                 },
//                 {
//                     "title": "Frontend Performance Optimization"
//                 },
//                 {
//                     "title": "Backend Performance Optimization"
//                 },
//                 {
//                     "title": "Database Performance Optimization"
//                 },
//                 {
//                     "title": "Network Performance Optimization"
//                 }
//             ]
//         },
//         {
//             "title": "Business and Legal",
//             "steps": [
//                 {
//                     "title": "Understanding Business Basics"
//                 },
//                 {
//                     "title": "Intellectual Property Rights"
//                 },
//                 {
//                     "title": "Privacy and Data Protection Laws"
//                 },
//                 {
//                     "title": "Accessibility and Compliance"
//                 },
//                 {
//                     "title": "Security Laws"
//                 },
//                 {
//                     "title": "Ethics in IT"
//                 }
//             ]
//         },
//         {
//             "title": "Advanced Topics",
//             "steps": [
//                 {
//                     "title": "Microservices Architecture"
//                 },
//                 {
//                     "title": "Real-Time Applications with Websockets"
//                 },
//                 {
//                     "title": "GraphQL"
//                 },
//                 {
//                     "title": "Progressive Web App (PWA)"
//                 },
//                 {
//                     "title": "Serverless Architecture"
//                 },
//                 {
//                     "title": "Scalability and Availability"
//                 }
//             ]
//         }
//     ]
// };
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">{roadmap.title}</h1>
//       <div className="flex justify-center">
//         <RoadmapNode
//           title={roadmap.title}
//           subtopics={roadmap.sections}
//           x={0}
//           y={0}
//         />
//       </div>
//     </div>


  //   <div className="container mx-auto px-4 py-8">
  //   <h1 className="text-3xl font-bold mb-8">{roadmap.title}</h1>
  //   <motion.div
  //     className="relative"
  //     initial={{ width: '0%' }}
  //     animate={{ width: '100%' }}
  //     transition={{ duration: 2, delay: 0.5 }}
  //   >
  //     <div className="absolute top-0 left-0 h-1 bg-blue-500" />
  //   </motion.div>
  //   <div className="space-y-8">
  //     {roadmap.sections.map((section, index) => (
  //       <RoadmapSection
  //         key={index}
  //         title={section.title}
  //         steps={section.steps}
  //       />
  //     ))}
  //   </div>
  // </div>



  //   <motion.div
  //   className="container mx-auto px-4 py-8"
  //   initial={{ opacity: 0 }}
  //   animate={{ opacity: 1 }}
  //   transition={{ duration: 1 }}
  // >
  //   <h1 className="text-3xl font-bold mb-8">{roadmap.title}</h1>
  //   <div className="space-y-8">
  //     {roadmap.sections.map((section, index) => (
  //       <RoadmapSection
  //         key={index}
  //         title={section.title}
  //         steps={section.steps}
  //       />
  //     ))}
  //   </div>
  // </motion.div>
//   );
// };

// export default Roadmap;


"use client";
import React from 'react';
import { motion } from 'framer-motion';
import './roadmap.css';

const roadmapData = {
  title: "Full Stack Development with Next.js, Nest.js, MySQL",
  sections: [
        {
          "title": "Basics of Web Development",
          "steps": [
            { "title": "HTML Basics" },
            { "title": "CSS Basics" },
            { "title": "JavaScript Basics" },
            { "title": "Understanding HTTP" },
            { "title": "Understanding Client-Server Architecture" },
            { "title": "Version Control with Git" }
          ]
        },
        {
          "title": "Fundamentals of Database",
          "steps": [
            { "title": "Basics of Relational Databases" },
            { "title": "SQL Basics" },
            { "title": "MySQL Database" },
            { "title": "Data Modeling and Design" },
            { "title": "Normalization" },
            { "title": "Database Transactions" }
          ]
        },
        {
          "title": "Introduction to Node.js",
          "steps": [
            { "title": "Node.js Fundamentals" },
            { "title": "Understanding Asynchronous Programming" },
            { "title": "Working with File System in Node.js" },
            { "title": "Node.js Modules" },
            { "title": "Building a HTTP Server with Node.js" },
            { "title": "Error Handling in Node.js" }
          ]
        },
        {
          "title": "Backend Development with Nest.js",
          "steps": [
            { "title": "Introduction to Nest.js" },
            { "title": "Understanding Typescript" },
            { "title": "Nest.js Modules, Controllers, Services" },
            { "title": "Building REST API with Nest.js" },
            { "title": "Data Validation and Serialization" },
            { "title": "Error Handling in Nest.js" }
          ]
        },
        {
          "title": "Frontend Development with Next.js",
          "steps": [
            { "title": "Introduction to Next.js" },
            { "title": "React Basics" },
            { "title": "Next.js Routing" },
            { "title": "Server-Side Rendering with Next.js" },
            { "title": "Styling in Next.js" },
            { "title": "Building a Frontend Application with Next.js" }
          ]
        },
        {
          "title": "Integration of Next.js and Nest.js",
          "steps": [
            { "title": "Setup and Configuration" },
            { "title": "Implementation of Client-Server Communication" },
            { "title": "Handling Authentication" },
            { "title": "Cross-Origin Resource Sharing (CORS)" },
            { "title": "Deployment Strategies" }
          ]
        },
        {
          "title": "Working with MySQL in Nest.js",
          "steps": [
            { "title": "MySQL Database Connection" },
            { "title": "Create, Read, Update, Delete (CRUD) Operations" },
            { "title": "Data Validation" },
            { "title": "Handling Database Errors" }
          ]
        },
        {
          "title": "State Management in Next.js",
          "steps": [
            { "title": "Understanding State Management" },
            { "title": "Introduction to Redux" },
            { "title": "Building a Redux Store" },
            { "title": "Redux Middleware" },
            { "title": "Asynchronous Actions in Redux" },
            { "title": "Redux DevTools" }
          ]
        },
        {
          "title": "Testing in Full Stack Development",
          "steps": [
            { "title": "Introduction to Testing" },
            { "title": "Unit Testing in Nest.js" },
            { "title": "Unit Testing in Next.js" },
            { "title": "Integration Testing" },
            { "title": "End-to-End Testing" },
            { "title": "Best Practices in Testing" }
          ]
        },
        {
          "title": "Deployment and DevOps",
          "steps": [
            { "title": "Basics of Hosting" },
            { "title": "Continuous Integration (CI) and Continuous Deployment (CD)" },
            { "title": "Docker Basics" },
            { "title": "Kubernetes Basics" },
            { "title": "CI/CD with Jenkins" },
            { "title": "Cloud Hosting Providers (AWS, Google Cloud, Azure)" }
          ]
        },
        {
          "title": "Performance Optimization",
          "steps": [
            { "title": "Basics of Performance Optimization" },
            { "title": "Webpack and Babel" },
            { "title": "Frontend Performance Optimization" },
            { "title": "Backend Performance Optimization" },
            { "title": "Database Performance Optimization" },
            { "title": "Network Performance Optimization" }
          ]
        },
        {
          "title": "Business and Legal",
          "steps": [
            { "title": "Understanding Business Basics" },
            { "title": "Intellectual Property Rights" },
            { "title": "Privacy and Data Protection Laws" },
            { "title": "Accessibility and Compliance" },
            { "title": "Security Laws" },
            { "title": "Ethics in IT" }
          ]
        },
        {
          "title": "Advanced Topics",
          "steps": [
            { "title": "Microservices Architecture" },
            { "title": "Real-Time Applications with Websockets" },
            { "title": "GraphQL" },
            { "title": "Progressive Web App (PWA)" },
            { "title": "Serverless Architecture" },
            { "title": "Scalability and Availability" }
          ]
        }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// const nodeVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: { opacity: 1, y: 0 },
// };

// const RoadmapNode = ({ title, description, children }) => {
//     return (
//       <motion.div
//         className="roadmap-node border-l-2 border-red-600 pl-1 relative bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
//         variants={nodeVariants}
//       >
//         <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
//         <p className="text-gray-700 dark:text-gray-300">{description}</p>
//         {children && (
//           <div className="roadmap-children ml-4 mt-4">
//             {children.map((child, index) => (
//               <RoadmapNode key={index} {...child} />
//             ))}
//           </div>
//         )}
//       </motion.div>
//     );
//   };

const nodeVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

const RoadmapStep = ({ title, description }) => {
    return (
      <motion.div
        className="roadmap-step bg-white dark:bg-gray-800 p-4 m-2 rounded shadow-lg"
        variants={nodeVariants}
      >
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </motion.div>
    );
  };

const RoadmapSection = ({ title, steps }) => {
    return (
      <motion.div
        className="roadmap-section p-6 m-4 bg-blue-50 dark:bg-gray-900 rounded-lg shadow-md"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <div className="roadmap-steps ml-6">
          {steps.map((step, index) => (
            <RoadmapStep key={index} {...step} />
          ))}
        </div>
      </motion.div>
    );
  };

const Roadmap = () => {
  return (
    <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
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

    // <div className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
    //   <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
    //     {roadmapData.title}
    //   </h1>
    //   <motion.div
    //     initial="hidden"
    //     animate="visible"
    //     transition={{ staggerChildren: 0.2 }}
    //   >
    //     {roadmapData.sections.map((step, index) => (
    //       <RoadmapNode key={index} {...step} />
    //     ))}
    //   </motion.div>
    // </div>



    // <div className="roadmap-container p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
    //   <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
    //     {roadmapData.title}
    //   </h1>
    //   {roadmapData.sections.map((section, index) => (
    //     <motion.div
    //       key={index}
    //       className="roadmap-section mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    //       variants={containerVariants}
    //       initial="hidden"
    //       animate="visible"
    //     >
    //       <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
    //         {section.title}
    //       </h2>
    //       <motion.div variants={itemVariants}>
    //         {section.steps.map((step, stepIndex) => (
    //           <motion.div
    //             key={stepIndex}
    //             className="roadmap-step mb-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg"
    //             variants={itemVariants}
    //           >
    //             <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
    //               {step.title}
    //             </h3>
    //           </motion.div>
    //         ))}
    //       </motion.div>
    //     </motion.div>
    //   ))}
    // </div>
  );
};

export default Roadmap;
