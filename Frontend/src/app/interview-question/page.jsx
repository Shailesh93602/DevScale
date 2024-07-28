"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

import { fetchData } from "../services/fetchData";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "@/lib/features/loader/loaderSlice";

const Page = () => {
  const [interviewquestions, setinterviewQuestions] = useState([]);

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchinterviewQuestions = async () => {
      try {
        dispatch(showLoader());
        const response = await fetchData(
          "GET",
          "/resources/interviewquestions"
        );
        dispatch(hideLoader());
        setinterviewQuestions(response.data.resource);
      } catch (e) {
        dispatch(hideLoader());
      }
    };
    fetchinterviewQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h1 className="text-5xl font-extrabold text-center text-indigo-800 dark:text-indigo-300 mb-12 tracking-tight">
          Interview Questions
        </h1>
        {interviewquestions.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">
              {category.category}
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-6">
              {category.questions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-indigo-100 dark:border-gray-700"
                >
                  <AccordionTrigger className="px-8 py-6 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-left">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 py-6 bg-indigo-50 dark:bg-gray-700">
                    <div className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      <p className="mb-4">{item.answer.introduction}</p>
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                        {item.answer.points.map((point, index) => (
                          <li key={index}>
                            <strong>{point.title}:</strong> {point.description}
                          </li>
                        ))}
                      </ul>
                      <p>{item.answer.conclusion}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
