"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

  const handleSolutionChange = (value) => {
    setSolution(value);
  };

  const handleSubmit = () => {
    console.log("Submitted solution:", solution);
  };

  if (!challenge) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 flex">
      <div className="w-1/2 pr-4">
        <div className="bg-light shadow-md rounded-lg p-6 h-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
      <div className="w-1/2 pl-4 flex flex-col">
        <div className="flex justify-center items-start pt-10 h-screen">
          <div className="w-full max-w-4xl p-4 border">
            <form action="#" onSubmit={handleSubmit}>
              <div className="">
                <label htmlFor="comment" className="sr-only">
                  Add your code
                </label>
                <Editor
                  height="50vh"
                  defaultLanguage="javascript"
                  defaultValue='Deno.serve(req => new Response("Hello!"));'
                />
              </div>
              <div className="flex justify-between pt-2">
                <div className="flex items-center space-x-5"></div>
                <div className="flex-shrink-0">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Run
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* <button
            onClick={handleSubmit}
            className="bg-blue-500 text-light px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
          >
            Submit Solution
          </button> */}
        </div>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import Editor from "@monaco-editor/react";

// const challenges = [
//   {
//     id: "two-sum",
//     title: "Two Sum Problem",
//     description:
//       "Find two numbers in an array that add up to a specific target.",
//     difficulty: "Easy",
//     inputFormat: "An array of integers and a target integer.",
//     outputFormat:
//       "Indices of the two numbers such that they add up to the target.",
//     sampleInput: "[2, 7, 11, 15], target = 9",
//     sampleOutput: "[0, 1]",
//   },
//   {
//     id: "reverse-linked-list",
//     title: "Reverse Linked List",
//     description: "Reverse a singly linked list.",
//     difficulty: "Medium",
//     inputFormat: "A singly linked list.",
//     outputFormat: "The reversed linked list.",
//     sampleInput: "1 -> 2 -> 3 -> 4 -> 5",
//     sampleOutput: "5 -> 4 -> 3 -> 2 -> 1",
//   },
//   {
//     id: "knapsack-problem",
//     title: "Knapsack Problem",
//     description:
//       "Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.",
//     difficulty: "Hard",
//     inputFormat:
//       "A list of items with weights and values, and a maximum weight limit.",
//     outputFormat: "The maximum value achievable within the weight limit.",
//     sampleInput:
//       "Items: [(weight: 1, value: 1), (weight: 3, value: 4), (weight: 4, value: 5), (weight: 5, value: 7)], Max weight: 7",
//     sampleOutput: "9",
//   },
// ];

// export default function ViewChallengePage({ params }) {
//   let { id } = params;
//   const challenge = challenges.find((challenge) => challenge.id === id);

//   const [solution, setSolution] = useState("");

//   const handleSolutionChange = (value) => {
//     setSolution(value);
//   };

//   const handleSubmit = () => {
//     console.log("Submitted solution:", solution);
//   };

//   if (!challenge) {
//     return <div className="container mx-auto p-4">Challenge not found.</div>;
//   }

//   return (
//     <div className="container mx-auto p-4 flex h-screen">
//       <div className="w-1/2 pr-4 overflow-auto">
//         <div className="bg-white shadow-md rounded-lg p-6 h-full">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             {challenge.title}
//           </h1>
//           <p className="text-gray-700 mb-2">
//             <strong>Description:</strong> {challenge.description}
//           </p>
//           <p className="text-gray-700 mb-2">
//             <strong>Difficulty:</strong> {challenge.difficulty}
//           </p>
//           <p className="text-gray-700 mb-2">
//             <strong>Input Format:</strong> {challenge.inputFormat}
//           </p>
//           <p className="text-gray-700 mb-2">
//             <strong>Output Format:</strong> {challenge.outputFormat}
//           </p>
//           <p className="text-gray-700 mb-2">
//             <strong>Sample Input:</strong> {challenge.sampleInput}
//           </p>
//           <p className="text-gray-700 mb-4">
//             <strong>Sample Output:</strong> {challenge.sampleOutput}
//           </p>
//         </div>
//       </div>
//       <div className="w-1/2 pl-4 flex flex-col">
//         <div className="bg-white shadow-md rounded-lg p-6 h-full flex flex-col">
//           <div className="flex-grow mb-4">
//             <Editor
//               height="calc(100vh - 10rem)"
//               language="javascript"
//               theme="vs-dark"
//               value={solution}
//               onChange={handleSolutionChange}
//               options={{
//                 selectOnLineNumbers: true,
//                 roundedSelection: false,
//                 readOnly: false,
//                 cursorStyle: "line",
//                 automaticLayout: true,
//               }}
//             />
//           </div>
//           <button
//             onClick={handleSubmit}
//             className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
//           >
//             Submit Solution
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
