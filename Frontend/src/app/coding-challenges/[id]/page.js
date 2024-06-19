"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";

const challenges = [
  {
    id: "two-sum",
    title: "Two Sum Problem",
    description:
      "Find two numbers in an array that add up to a specific target.",
    difficulty: "Easy",
    inputFormat: "An array of integers and a target integer.",
    outputFormat:
      "Indices of the two numbers such that they add up to the target.",
    sampleInput: "[2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    description: "Reverse a singly linked list.",
    difficulty: "Medium",
    inputFormat: "A singly linked list.",
    outputFormat: "The reversed linked list.",
    sampleInput: "1 -> 2 -> 3 -> 4 -> 5",
    sampleOutput: "5 -> 4 -> 3 -> 2 -> 1",
  },
  {
    id: "knapsack-problem",
    title: "Knapsack Problem",
    description:
      "Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.",
    difficulty: "Hard",
    inputFormat:
      "A list of items with weights and values, and a maximum weight limit.",
    outputFormat: "The maximum value achievable within the weight limit.",
    sampleInput:
      "Items: [(weight: 1, value: 1), (weight: 3, value: 4), (weight: 4, value: 5), (weight: 5, value: 7)], Max weight: 7",
    sampleOutput: "9",
  },
];

export default function ViewChallengePage({ params }) {
  let { id } = params;
  const challenge = challenges.find((challenge) => challenge.id === id);

  const [solution, setSolution] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!challenge) {
      router.push("/coding-challenges");
    }
  }, [challenge, router]);

  const handleSolutionChange = (value) => {
    setSolution(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const response = await fetch("http://localhost:4000/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code: solution,
        }),
        credentials: "include",
      });
      console.log(response);

      const result = await response.json();
      if (result.error) {
        setOutput(result.error);
      } else {
        setOutput(result.output);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!challenge) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 pr-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {challenge.title}
          </h1>
          <p className="text-gray-700 mb-2">
            <strong>Description:</strong> {challenge.description}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Difficulty:</strong> {challenge.difficulty}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Input Format:</strong> {challenge.inputFormat}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Output Format:</strong> {challenge.outputFormat}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Sample Input:</strong> {challenge.sampleInput}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Sample Output:</strong> {challenge.sampleOutput}
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 pl-4 flex flex-col">
        <div className="bg-white shadow-md rounded-lg p-6 h-full flex flex-col">
          <div className="flex justify-between mb-4">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              {/* Add more languages as needed */}
            </select>
            <button
              onClick={handleRunCode}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
          <div className="flex-grow mb-4">
            <Editor
              height="calc(100vh - 20rem)"
              language={language}
              theme="vs-dark"
              value={solution}
              onChange={handleSolutionChange}
              options={{
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: "line",
                automaticLayout: true,
              }}
            />
          </div>
          <div className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
            <pre>{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
