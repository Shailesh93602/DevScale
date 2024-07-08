"use client";
import { useContext, useEffect, useState } from "react";
import "./styles.css";
// import { UserContext } from '../../context/UserContext';
import { useRouter } from "next/navigation";

export default function CodingChallengesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [challenges, setChallenges] = useState([
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
  ]);

  // const { authenticated } = useContext(UserContext);
  const router = useRouter();

  // useEffect(() => {
  //   if (!authenticated) {
  //     router.push("/u/login");
  //   }
  // });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-light  dark:bg-gray-800  shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-900 mb-4">
          Coding Challenges
        </h1>
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-6 border border-gray-300 rounded-md text-dark dark:bg-gray-800"
        />

        {filteredChallenges.length > 0 ? (
          <ul className="space-y-4">
            {filteredChallenges.map((challenge, index) => (
              <li
                key={index}
                className="bg-gray-100  dark:bg-gray-600  p-4 rounded-md shadow"
              >
                <h2 className="text-xl font-semibold dark:text-gray-200 text-gray-900">
                  {challenge.title}
                </h2>
                <p className="dark:text-gray-200 stext-gray-700">
                  {challenge.description}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                    challenge.difficulty === "Easy"
                      ? "bg-green-200 text-green-800"
                      : challenge.difficulty === "Medium"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {challenge.difficulty}
                </span>
                <a
                  href={challenge.link}
                  className="text-blue-500 hover:underline mt-2 block"
                >
                  View Challenge
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No challenges found.</p>
        )}
      </div>
    </div>
  );
}
