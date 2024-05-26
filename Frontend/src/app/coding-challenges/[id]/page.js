"use client";
import { useState } from 'react';

const challenges = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    description: 'Find two numbers in an array that add up to a specific target.',
    difficulty: 'Easy',
    inputFormat: 'An array of integers and a target integer.',
    outputFormat: 'Indices of the two numbers such that they add up to the target.',
    sampleInput: '[2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]'
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    description: 'Reverse a singly linked list.',
    difficulty: 'Medium',
    inputFormat: 'A singly linked list.',
    outputFormat: 'The reversed linked list.',
    sampleInput: '1 -> 2 -> 3 -> 4 -> 5',
    sampleOutput: '5 -> 4 -> 3 -> 2 -> 1'
  },
  {
    id: 'knapsack-problem',
    title: 'Knapsack Problem',
    description: 'Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.',
    difficulty: 'Hard',
    inputFormat: 'A list of items with weights and values, and a maximum weight limit.',
    outputFormat: 'The maximum value achievable within the weight limit.',
    sampleInput: 'Items: [(weight: 1, value: 1), (weight: 3, value: 4), (weight: 4, value: 5), (weight: 5, value: 7)], Max weight: 7',
    sampleOutput: '9'
  }
];
export default function ViewChallengePage({ params }) {
  let { id } = params;
  const challenge = challenges.find(challenge => challenge.id === id);

  const [solution, setSolution] = useState('');

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Submitted solution:', solution);
  };

  if (!challenge) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{challenge.title}</h1>
        <p className="text-gray-700 mb-2"><strong>Description:</strong> {challenge.description}</p>
        <p className="text-gray-700 mb-2"><strong>Difficulty:</strong> {challenge.difficulty}</p>
        <p className="text-gray-700 mb-2"><strong>Input Format:</strong> {challenge.inputFormat}</p>
        <p className="text-gray-700 mb-2"><strong>Output Format:</strong> {challenge.outputFormat}</p>
        <p className="text-gray-700 mb-2"><strong>Sample Input:</strong> {challenge.sampleInput}</p>
        <p className="text-gray-700 mb-4"><strong>Sample Output:</strong> {challenge.sampleOutput}</p>
        <textarea
          value={solution}
          onChange={handleSolutionChange}
          placeholder="Write your solution here..."
          className="w-full p-2 mb-4 border border-gray-300 rounded-md text-black"
          rows="6"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Submit Solution
        </button>
      </div>
    </div>
  );
}
