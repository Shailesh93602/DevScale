"use client";
import React, { useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function Quiz({ topicId }: { topicId: string }) {
  const [score] = useState(0);
  const router = useRouter();

  const submitQuiz = async () => {
    try {
      const response = await fetchData("post", `/quizzes/submit`, {
        topicId,
        score,
      });

      if (response.data.success) {
        toast.success("Quiz submitted successfully!");
        router.push("/profile");
      } else {
        toast.error("Failed to submit quiz.");
      }
    } catch (error) {
      toast.error("Error submitting quiz.");
      console.error(error);
    }
  };
  return (
    <div>
      <h1>Quiz for Topic {topicId}</h1>
      <button onClick={submitQuiz}>Submit Quiz</button>
    </div>
  );
}
