'use client';
// import { useRouter } from "next/navigation";
import { PinContainer } from '@/components/3dPin';
import { HoverEffect } from '@/components/CardHoverEffect';
import { InfiniteMovingCards } from '@/components/InfiniteMovingCards';
import { HoverBorderGradient } from '@/components/HoverBorderGradient';
import { AceternityLogo } from '@/components/AceternityLogo';

export default function PlacementPreparation() {
  // const router = useRouter();

  // const handleClick = () => {
  //   router.replace("/interview-question");
  // };

  const interviewTips = [
    {
      title: 'Data Structures & Algorithms',
      description:
        'Master fundamental data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming). Practice solving problems on platforms like LeetCode or HackerRank regularly.',
      link: '/resources',
    },
    {
      title: 'System Design Basics',
      description:
        'Understand basic system design concepts like scalability, load balancing, and caching. Be prepared to discuss high-level architecture for simple applications.',
      link: '/resources',
    },
    {
      title: 'Programming Languages',
      description:
        'Be proficient in at least one programming language (e.g., Java, Python, C++). Understand object-oriented programming principles and be able to write clean, efficient code.',
      link: '/resources',
    },
    {
      title: 'Project Experience',
      description:
        'Develop personal projects or contribute to open-source. Be prepared to discuss your projects in detail, explaining your role, challenges faced, and solutions implemented.',
      link: '/resources',
    },
    {
      title: 'Behavioral Questions',
      description:
        'Prepare for common behavioral questions using the STAR method (Situation, Task, Action, Result). Have examples ready for teamwork, conflict resolution, and problem-solving scenarios.',
      link: '/resources',
    },
    {
      title: 'Company Research',
      description:
        "Research the company you're interviewing with. Understand their products, culture, and recent news. Prepare thoughtful questions to ask your interviewers.",
      link: '/resources',
    },
    {
      title: 'Mock Interviews',
      description:
        'Practice mock interviews with peers or use online platforms. Get comfortable explaining your thought process while solving problems out loud.',
      link: '/resources',
    },
    {
      title: 'Soft Skills',
      description:
        'Develop your communication skills. Practice explaining complex technical concepts in simple terms. Show enthusiasm for learning and teamwork.',
      link: '/resources',
    },
    {
      title: 'Resume Building',
      description:
        'Craft a clear, concise resume highlighting your skills, projects, and any internship experience. Tailor your resume for each application.',
      link: '/resources',
    },
    {
      title: 'Technical Concepts',
      description:
        'Review core CS concepts like operating systems, databases, and networking. Be prepared to discuss basic principles and their practical applications.',
      link: '/resources',
    },
  ];

  const interviewQuestions = [
    {
      quote:
        'Can you explain the difference between a stack and a queue, and provide an example use case for each?',
      name: 'Data Structures',
      title: 'Technical Question',
    },
    {
      quote:
        'What is the time complexity of quicksort in the best, average, and worst cases? How does it compare to other sorting algorithms?',
      name: 'Algorithms',
      title: 'Technical Question',
    },
    {
      quote:
        "Can you describe a challenging bug you've encountered and how you resolved it?",
      name: 'Problem Solving',
      title: 'Behavioral Question',
    },
    {
      quote:
        'How would you design a simple key-value store database from scratch?',
      name: 'System Design',
      title: 'Technical Question',
    },
    {
      quote:
        'What are the four pillars of Object-Oriented Programming? Can you give an example of each?',
      name: 'OOP Concepts',
      title: 'Technical Question',
    },
    {
      quote:
        'Tell me about a time when you had to work on a project with a tight deadline. How did you manage your time and ensure the project was completed?',
      name: 'Time Management',
      title: 'Behavioral Question',
    },
    {
      quote:
        "What's the difference between a process and a thread? How do they relate to concurrency in programming?",
      name: 'Operating Systems',
      title: 'Technical Question',
    },
    {
      quote:
        'How do you stay updated with the latest technologies and programming trends?',
      name: 'Continuous Learning',
      title: 'Behavioral Question',
    },
    {
      quote:
        'Can you explain the concept of RESTful APIs and give an example of how you would design one?',
      name: 'Web Development',
      title: 'Technical Question',
    },
    {
      quote:
        'Describe a situation where you had a disagreement with a team member. How did you handle it?',
      name: 'Teamwork',
      title: 'Behavioral Question',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
      {/* <h1 className="text-4xl font-bold dark:text-gray-200 text-gray-900 mb-6"> */}
      {/* Placement Preparation */}
      {/* </h1> */}

      <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Practice Tests</h2>
        <PinContainer title="coding-challenges" href="/coding-challenges">
          <div className="flex h-[20rem] w-[20rem] basis-full flex-col p-4 tracking-tight sm:basis-1/2">
            <h3 className="!m-0 max-w-xs !pb-2 text-base font-bold">
              Mr Engineer
            </h3>
            <div className="!m-0 !p-0 text-base font-normal">
              <span className="text-grayText">
                conqueror your dream job by solving coding questions
              </span>
            </div>
            <div className="mt-4 flex w-full flex-1 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500" />
          </div>
        </PinContainer>
        <p className="mt-14">
          Take a variety of practice tests to prepare for your placement exams.
          These tests cover different subjects and topics that are commonly seen
          in placement exams.
        </p>
        <div className="pt-5">
          <HoverBorderGradient
            href="#"
            containerClassName="rounded-full"
            as="button"
            className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
          >
            <AceternityLogo />
            <span>Start Practice Tests</span>
          </HoverBorderGradient>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
        <h2 className="text-2xl font-semibold">Interview Tips</h2>
        <HoverEffect items={interviewTips} />
        <p className="">
          Learn about the best strategies and tips to succeed in interviews.
          From understanding the company culture to practicing common questions,
          we’ve got you covered.
        </p>
        <div className="pt-5">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
          >
            <AceternityLogo />
            <span>Read Interview Tips</span>
          </HoverBorderGradient>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">Resume Building</h2>
        <p className="text-grayText">
          Create a professional resume that stands out. Use our resume building
          tools and templates to highlight your skills and experiences
          effectively.
        </p>
        <div className="pt-5">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
          >
            <AceternityLogo />
            <span>Build your Resume</span>
          </HoverBorderGradient>
        </div>
      </div>

      <div className="rounded-lg bg-lightSecondary p-6 shadow">
        <h2 className="mb-4 text-2xl font-semibold">
          Common Interview Questions
        </h2>
        <InfiniteMovingCards
          items={interviewQuestions}
          direction="left"
          speed="slow"
        />
        <p className="pt-5">
          Prepare for your interviews by practicing answers to the most common
          interview questions. This will help you to articulate your thoughts
          and experiences clearly.
        </p>
        <div className="pt-5">
          <HoverBorderGradient
            href="/interview-question"
            containerClassName="rounded-full"
            as="button"
            className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
          >
            <AceternityLogo />
            <span>view Questions</span>
          </HoverBorderGradient>
        </div>
      </div>
    </div>
  );
}
