"use client";

import Image from "next/image";
import { useEffect } from "react";
// import { UserContext } from '../../context/UserContext';
import { useRouter } from "next/navigation";
import { PinContainer } from "@/components/ui/3d-pin";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function PlacementPreparation() {
  // const { authenticated } = useContext(UserContext)
  const router = useRouter();
  const interviewTips = [
    {
      title: "Data Structures & Algorithms",
      description:
        "Master fundamental data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming). Practice solving problems on platforms like LeetCode or HackerRank regularly.",
      link: "https://leetcode.com",
    },
    {
      title: "System Design Basics",
      description:
        "Understand basic system design concepts like scalability, load balancing, and caching. Be prepared to discuss high-level architecture for simple applications.",
      link: "https://github.com/donnemartin/system-design-primer",
    },
    {
      title: "Programming Languages",
      description:
        "Be proficient in at least one programming language (e.g., Java, Python, C++). Understand object-oriented programming principles and be able to write clean, efficient code.",
      link: "https://www.codecademy.com",
    },
    {
      title: "Project Experience",
      description:
        "Develop personal projects or contribute to open-source. Be prepared to discuss your projects in detail, explaining your role, challenges faced, and solutions implemented.",
      link: "https://github.com",
    },
    {
      title: "Behavioral Questions",
      description:
        "Prepare for common behavioral questions using the STAR method (Situation, Task, Action, Result). Have examples ready for teamwork, conflict resolution, and problem-solving scenarios.",
      link: "https://www.themuse.com/advice/star-interview-method",
    },
    {
      title: "Company Research",
      description:
        "Research the company you're interviewing with. Understand their products, culture, and recent news. Prepare thoughtful questions to ask your interviewers.",
      link: "https://www.glassdoor.com",
    },
    {
      title: "Mock Interviews",
      description:
        "Practice mock interviews with peers or use online platforms. Get comfortable explaining your thought process while solving problems out loud.",
      link: "https://www.pramp.com",
    },
    {
      title: "Soft Skills",
      description:
        "Develop your communication skills. Practice explaining complex technical concepts in simple terms. Show enthusiasm for learning and teamwork.",
      link: "https://www.coursera.org/learn/teamwork-skills-effective-communication",
    },
    {
      title: "Resume Building",
      description:
        "Craft a clear, concise resume highlighting your skills, projects, and any internship experience. Tailor your resume for each application.",
      link: "https://www.resume.com",
    },
    {
      title: "Technical Concepts",
      description:
        "Review core CS concepts like operating systems, databases, and networking. Be prepared to discuss basic principles and their practical applications.",
      link: "https://teachyourselfcs.com",
    },
  ];

  const interviewQuestions = [
    {
      quote:
        "Can you explain the difference between a stack and a queue, and provide an example use case for each?",
      name: "Data Structures",
      title: "Technical Question",
    },
    {
      quote:
        "What is the time complexity of quicksort in the best, average, and worst cases? How does it compare to other sorting algorithms?",
      name: "Algorithms",
      title: "Technical Question",
    },
    {
      quote:
        "Can you describe a challenging bug you've encountered and how you resolved it?",
      name: "Problem Solving",
      title: "Behavioral Question",
    },
    {
      quote:
        "How would you design a simple key-value store database from scratch?",
      name: "System Design",
      title: "Technical Question",
    },
    {
      quote:
        "What are the four pillars of Object-Oriented Programming? Can you give an example of each?",
      name: "OOP Concepts",
      title: "Technical Question",
    },
    {
      quote:
        "Tell me about a time when you had to work on a project with a tight deadline. How did you manage your time and ensure the project was completed?",
      name: "Time Management",
      title: "Behavioral Question",
    },
    {
      quote:
        "What's the difference between a process and a thread? How do they relate to concurrency in programming?",
      name: "Operating Systems",
      title: "Technical Question",
    },
    {
      quote:
        "How do you stay updated with the latest technologies and programming trends?",
      name: "Continuous Learning",
      title: "Behavioral Question",
    },
    {
      quote:
        "Can you explain the concept of RESTful APIs and give an example of how you would design one?",
      name: "Web Development",
      title: "Technical Question",
    },
    {
      quote:
        "Describe a situation where you had a disagreement with a team member. How did you handle it?",
      name: "Teamwork",
      title: "Behavioral Question",
    },
  ];

  // useEffect(() => {
  //   if (!authenticated) {
  //     router.push('/u/login');
  //   }
  // })

  return (
    <div className="min-h-screen  dark:bg-gray-800  bg-gray-100 py-12">
      <div className="max-w-7xl  mx-auto px-6  rounded-lg  lg:px-8 bg-blue-50 dark:bg-gray-900 ">
        <h1 className="text-4xl font-bold dark:text-gray-200 text-gray-900 mb-6">
          Placement Preparation
        </h1>

        <div className="bg-light rounded-lg dark:bg-gray-600 shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200 font-semibold text-gray-800 mb-4">
            Practice Tests
          </h2>
          {/* <Image
            src="/placement-preparation.svg"
            alt="Practice Tests"
            width={550}
            height={310}
          /> */}
          <PinContainer title="coding-challenges" href="/coding-challenges">
            <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
              <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
                Mr Engineer
              </h3>
              <div className="text-base !m-0 !p-0 font-normal">
                <span className="text-slate-500 ">
                  conqueror your dream job by solving coding questions
                </span>
              </div>
              <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500" />
            </div>
          </PinContainer>
          <p className="mt-14 dark:text-gray-200 text-gray-600">
            Take a variety of practice tests to prepare for your placement
            exams. These tests cover different subjects and topics that are
            commonly seen in placement exams.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Start Practice Tests
          </button>
        </div>

        <div className="bg-light rounded-lg dark:bg-gray-600 dark:text-gray-200 shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold dark:text-gray-200 text-gray-800 mb-4">
            Interview Tips
          </h2>
          <HoverEffect items={interviewTips} />
          <p className="text-gray-600 dark:text-gray-300">
            Learn about the best strategies and tips to succeed in interviews.
            From understanding the company culture to practicing common
            questions, we’ve got you covered.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Read Interview Tips
          </button>
        </div>

        <div className="bg-light dark:bg-gray-600 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200 font-semibold text-gray-800 mb-4">
            Resume Building
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create a professional resume that stands out. Use our resume
            building tools and templates to highlight your skills and
            experiences effectively.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Build Your Resume
          </button>
        </div>

        <div className="bg-light dark:bg-gray-600 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold dark:text-gray-200 text-gray-800 mb-4">
            Common Interview Questions
          </h2>
          <InfiniteMovingCards
            items={interviewQuestions}
            direction="left"
            speed="slow"
          />
          <p className="text-gray-600 pt-5 dark:text-gray-300">
            Prepare for your interviews by practicing answers to the most common
            interview questions. This will help you to articulate your thoughts
            and experiences clearly.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            View Questions
          </button>
        </div>
      </div>
    </div>
  );
}
