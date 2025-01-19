"use client";
import { useState } from "react";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is the purpose of this website?",
      answer:
        "This website is designed to help users enhance their coding skills through various resources, challenges, and community interactions.",
    },
    {
      question: "How can I join the community?",
      answer:
        "You can join the community by signing up for an account and participating in forums, events, and collaboration opportunities.",
    },
    {
      question: "What types of coding challenges are available?",
      answer:
        "We offer a variety of coding challenges ranging from beginner to advanced levels across different programming languages.",
    },
    {
      question: "How can I track my progress?",
      answer:
        "You can track your progress through your profile page where all your activities, completed challenges, and achievements are displayed.",
    },
    {
      question: "Is there any cost to join?",
      answer:
        "No, joining the community and accessing the resources on this website is completely free.",
    },
  ];

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h1>

        <div className="bg-light rounded-lg shadow p-6">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="w-full text-left text-gray-800 font-semibold text-lg focus:outline-none"
                onClick={() => handleToggle(index)}
              >
                {faq.question}
              </button>
              <div
                className={`mt-2 text-gray-600 ${
                  activeIndex === index ? "block" : "hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
