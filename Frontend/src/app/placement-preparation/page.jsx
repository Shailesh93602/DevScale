"use client";

import Image from "next/image";
import { useEffect } from "react";
// import { UserContext } from '../../context/UserContext';
import { useRouter } from "next/navigation";

export default function PlacementPreparation() {
  // const { authenticated } = useContext(UserContext)
  const router = useRouter();

  // useEffect(() => {
  //   if (!authenticated) {
  //     router.push('/u/login');
  //   }
  // })

  return (
    <div className="min-h-screen  dark:bg-gray-800  bg-gray-100 py-12">
      <div className="max-w-7xl mx-5 rounded-lg px-6 lg:px-8 bg-blue-50 dark:bg-gray-900 ">
        <h1 className="text-4xl font-bold dark:text-gray-200 text-gray-900 mb-6">
          Placement Preparation
        </h1>

        <div className="bg-gray-100 rounded-lg dark:bg-gray-800 shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200 font-semibold text-gray-800 mb-4">
            Practice Tests
          </h2>
          <Image
            src="/placement-preparation.svg"
            alt="Practice Tests"
            width={550}
            height={310}
          />
          <p className="mt-4 dark:text-gray-200 text-gray-600">
            Take a variety of practice tests to prepare for your placement
            exams. These tests cover different subjects and topics that are
            commonly seen in placement exams.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Start Practice Tests
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-200 shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold dark:text-gray-200 text-gray-800 mb-4">
            Interview Tips
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Learn about the best strategies and tips to succeed in interviews.
            From understanding the company culture to practicing common
            questions, we’ve got you covered.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Read Interview Tips
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
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

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold dark:text-gray-200 text-gray-800 mb-4">
            Common Interview Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
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
