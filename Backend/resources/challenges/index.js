export const challenges = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "Easy",
    inputFormat: "An array of integers and a target integer.",
    outputFormat: "Indices of the two numbers in the array.",
    exampleInput: "[2, 7, 11, 15], target = 9",
    exampleOutput: "[0, 1]",
    constraints:
      "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    functionSignature: "function twoSum(nums, target) {}",
  },
  {
    title: "Reverse a Linked List",
    description: "Reverse a singly linked list.",
    difficulty: "Medium",
    inputFormat: "A singly linked list.",
    outputFormat: "The linked list in reversed order.",
    exampleInput: "1 -> 2 -> 3 -> 4 -> 5",
    exampleOutput: "5 -> 4 -> 3 -> 2 -> 1",
    constraints: "The number of nodes in the list is the range [0, 5000].",
    functionSignature: "function reverseList(head) {}",
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description:
      "Find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    inputFormat: "A string s.",
    outputFormat:
      "An integer representing the length of the longest substring.",
    exampleInput: "abcabcbb",
    exampleOutput: "3",
    constraints: "The input string length is between 0 and 5 * 10^4.",
    functionSignature: "function lengthOfLongestSubstring(s) {}",
  },
  {
    title: "Merge Two Sorted Lists",
    description:
      "Merge two sorted linked lists and return it as a sorted list.",
    difficulty: "Easy",
    inputFormat: "Two sorted linked lists.",
    outputFormat: "A sorted linked list.",
    exampleInput: "1 -> 2 -> 4, 1 -> 3 -> 4",
    exampleOutput: "1 -> 1 -> 2 -> 3 -> 4 -> 4",
    constraints: "The number of nodes in both lists is in the range [0, 50].",
    functionSignature: "function mergeTwoLists(list1, list2) {}",
  },
  {
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    inputFormat:
      "A string containing characters '(', ')', '{', '}', '[' and ']'.",
    outputFormat: "A boolean indicating whether the string is valid.",
    exampleInput: "s = '()[]{}'",
    exampleOutput: "true",
    constraints: "The input string length is between 1 and 10^4.",
    functionSignature: "function isValid(s) {}",
  },
];
