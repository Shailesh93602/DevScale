"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/app/services/fetchData";

const challenges = [
  {
    title: "Two Sum Problem",
    description:
      "Find two numbers in an array that add up to a specific target.",
    difficulty: "Easy",
    link: "/coding-challenges/two-sum",
  },
  {
    title: "Reverse Linked List",
    description: "Reverse a singly linked list.",
    difficulty: "Medium",
    link: "/coding-challenges/reverse-linked-list",
  },
  {
    title: "Knapsack Problem",
    description:
      "Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.",
    difficulty: "Hard",
    link: "/coding-challenges/knapsack-problem",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    inputFormat: "A string containing parentheses, brackets, and curly braces.",
    outputFormat: "Boolean indicating whether the input string is valid.",
    sampleInput: "({[]})",
    sampleOutput: "true",
    link: "/coding-challenges/valid-parentheses",
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
    difficulty: "Medium",
    inputFormat: "An array of interval arrays.",
    outputFormat: "An array of merged interval arrays.",
    sampleInput: "[[1,3],[2,6],[8,10],[15,18]]",
    sampleOutput: "[[1,6],[8,10],[15,18]]",
    link: "/coding-challenges/merge-intervals",
  },

  {
    id: "lru-cache",
    title: "LRU Cache",
    description:
      "Design and implement a data structure for Least Recently Used (LRU) cache.",
    difficulty: "Hard",
    inputFormat:
      "A series of get and put operations with a specified capacity.",
    outputFormat: "Results of the operations based on LRU policy.",
    sampleInput:
      "LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); cache.get(2);",
    sampleOutput: "null, null, 1, null, -1",
    link: "/coding-challenges/lru-cache",
  },
  {
    id: "binary-search",
    title: "Binary Search",
    description:
      "Implement binary search algorithm to find the position of a target value within a sorted array.",
    difficulty: "Easy",
    inputFormat: "A sorted array of integers and a target value.",
    outputFormat:
      "The index of the target value in the array, or -1 if not found.",
    sampleInput: "[1, 3, 5, 7, 9], target = 5",
    sampleOutput: "2",
    link: "/coding-challenges/binary-search",
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    description:
      "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Medium",
    inputFormat: "A string.",
    outputFormat: "The longest palindromic substring.",
    sampleInput: "babad",
    sampleOutput: "bab",
    link: "/coding-challenges/longest-palindromic-substring",
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    description:
      "Given two words (beginWord and endWord), and a dictionary's word list, find the length of shortest transformation sequence from beginWord to endWord, such that only one letter can be changed at a time and each transformed word must exist in the word list.",
    difficulty: "Hard",
    inputFormat:
      "Two strings (beginWord and endWord) and an array of strings (wordList).",
    outputFormat:
      "An integer representing the shortest transformation sequence length.",
    sampleInput:
      "beginWord = 'hit', endWord = 'cog', wordList = ['hot','dot','dog','lot','log','cog']",
    sampleOutput: "5",
    link: "/coding-challenges/word-ladder",
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    description:
      "Find the contiguous subarray within an array (containing at least one number) which has the largest sum.",
    difficulty: "Easy",
    inputFormat: "An array of integers.",
    outputFormat: "The sum of the contiguous subarray with the largest sum.",
    sampleInput: "[-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6",
    link: "/coding-challenges/maximum-subarray",
  },
  {
    id: "find-duplicate",
    title: "Find the Duplicate Number",
    description:
      "Given an array of integers containing n + 1 integers where each integer is in the range [1, n] inclusive, find the duplicate number.",
    difficulty: "Medium",
    inputFormat: "An array of integers.",
    outputFormat: "The duplicate number in the array.",
    sampleInput: "[3,1,3,4,2]",
    sampleOutput: "3",
    link: "/coding-challenges/find-duplicate",
  },
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    inputFormat:
      "An array of non-negative integers representing heights of walls.",
    outputFormat: "The total amount of rainwater that can be trapped.",
    sampleInput: "[0,1,0,2,1,0,1,3,2,1,2,1]",
    sampleOutput: "6",
    link: "/coding-challenges/trapping-rain-water",
  },
  {
    id: "3sum",
    title: "3Sum",
    description:
      "Given an array of integers, find all unique triplets in the array which gives the sum of zero.",
    difficulty: "Medium",
    inputFormat: "An array of integers.",
    outputFormat: "An array of all unique triplets that sum to zero.",
    sampleInput: "[-1,0,1,2,-1,-4]",
    sampleOutput: "[[-1,-1,2],[-1,0,1]]",
    link: "/coding-challenges/3sum",
  },
  {
    id: "rotate-array",
    title: "Rotate Array",
    description:
      "Given an array, rotate the array to the right by k steps, where k is non-negative.",
    difficulty: "Easy",
    inputFormat: "An array of integers and a non-negative integer k.",
    outputFormat: "The rotated array.",
    sampleInput: "nums = [1,2,3,4,5,6,7], k = 3",
    sampleOutput: "[5,6,7,1,2,3,4]",
    link: "/coding-challenges/rotate-array",
  },
  {
    id: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    description:
      "Merge k sorted linked lists and return it as one sorted list.",
    difficulty: "Hard",
    inputFormat: "An array of k linked-lists.",
    outputFormat: "A single merged, sorted linked-list.",
    sampleInput: "[[1,4,5],[1,3,4],[2,6]]",
    sampleOutput: "[1,1,2,3,4,4,5,6]",
    link: "/coding-challenges/merge-k-sorted-lists",
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    inputFormat: "An integer n, representing the number of stairs.",
    outputFormat:
      "An integer representing the number of distinct ways to climb the stairs.",
    sampleInput: "n = 3",
    sampleOutput: "3",
    link: "/coding-challenges/climbing-stairs",
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    inputFormat: "A string s.",
    outputFormat:
      "An integer representing the length of the longest substring without repeating characters.",
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    link: "/coding-challenges/longest-substring-without-repeating-characters",
  },
  {
    id: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "Hard",
    inputFormat: "Two sorted arrays of integers.",
    outputFormat: "A float representing the median of the two arrays.",
    sampleInput: "nums1 = [1,3], nums2 = [2]",
    sampleOutput: "2.0",
    link: "/coding-challenges/median-of-two-sorted-arrays",
  },
];

export default function ViewChallengePage({ params }) {
  let { id } = params;

  const challenge = challenges.find((challenge) => challenge.id !== id);

  const [solution, setSolution] = useState({
    javascript: `// JavaScript boilerplate
function main() {
    console.log('Hello, World!');
}
main();`,
    python: `# Python boilerplate
if __name__ == "__main__":
    print("Hello, World!")`,
    java: `class MrEngineers {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    ruby: `# Ruby boilerplate
puts 'Hello, World!'`,
    swift: `import Foundation

print("Hello, World!")`,
  });

  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);

  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (!challenge) {
      router.push("/coding-challenges");
    }
  }, [challenge, router]);

  const handleSolutionChange = (value) => {
    setSolution({ ...solution, [language]: value });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const response = await fetchData("POST", "/run-code", {
        language,
        code: solution[language],
      });
      if (response.data?.error) {
        setOutput(data.error);
      } else {
        setOutput(response.data?.output);
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
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {challenge.title}
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Description:</strong> {challenge.description}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Difficulty:</strong> {challenge.difficulty}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Input Format:</strong> {challenge.inputFormat}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Output Format:</strong> {challenge.outputFormat}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Sample Input:</strong> {challenge.sampleInput}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Sample Output:</strong> {challenge.sampleOutput}
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 pl-4 flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 h-full flex flex-col">
          <div className="flex justify-between mb-4">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
            </select>

            <Button
              onClick={handleRunCode}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md"
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          </div>
          <div className="flex-grow mb-4">
            <Editor
              height="calc(100vh - 20rem)"
              language={language}
              theme={theme === "dark" ? "vs-dark" : "vs-light"}
              value={solution[language]}
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
          <div className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-md overflow-auto">
            <pre>{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
