"use client";
import { useEffect, useState } from "react";
import "./styles.css";
import { fetchData } from "../services/fetchData";

export default function CodingChallengesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchChallenges = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetchData("get", `/challenges?page=${page}`);
      const data = await response.data;

      setChallenges((prevChallenges) => [
        ...prevChallenges,
        ...data.challenges,
      ]);

      setHasMore(page < data.totalPages);
      setIsFetching(false);
    } catch (err) {
      setIsFetching(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (hasMore && !isFetching && !error) {
      fetchChallenges();
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasMore &&
        !isFetching &&
        !error
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetching, error]);

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="bg-lightSecondary shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Coding Challenges</h1>
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 mb-6 border border-border rounded-md text-dark bg-light"
        />

        {filteredChallenges.length > 0 ? (
          <ul className="space-y-4">
            {filteredChallenges.map((challenge, index) => (
              <li
                key={challenge.id}
                className="bg-light p-4 rounded-md shadow-xl"
              >
                <h2 className="text-xl font-semibold">{challenge.title}</h2>
                <p className="text-grayText">{challenge.description}</p>
                <span
                  className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                    challenge.difficulty === "Easy" &&
                    "bg-green-200 text-green-800"
                  }
                    ${
                      challenge.difficulty === "Medium" &&
                      "bg-yellow-200 text-yellow-800"
                    }
                    ${
                      challenge.difficulty === "Hard" &&
                      "bg-red-200 text-red-800"
                    }
                  }`}
                >
                  {challenge.difficulty}
                </span>
                <a
                  href={"coding-challenges/" + challenge.id}
                  className="text-primary hover:text-primary2 hover:underline mt-2 block"
                  target="_blank"
                >
                  View Challenge
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No challenges found.</p>
        )}

        {isFetching && <p>Loading more challenges...</p>}
      </div>
    </div>
  );
}
