'use client';
import { useEffect, useState } from 'react';
import './styles.css';
import { fetchData } from '../services/fetchData';

export default function CodingChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [challenges, setChallenges] = useState<
    { id: string; title: string; description: string; difficulty: string }[]
  >([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchChallenges = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetchData('get', `/challenges?page=${page}`);
      const data = await response.data;

      setChallenges((prevChallenges) => [
        ...prevChallenges,
        ...data.challenges,
      ]);

      setHasMore(page < data.totalPages);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      setError((error as { message: string }).message);
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetching, error]);

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg bg-lightSecondary p-6 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Coding Challenges</h1>
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchTerm}
          onChange={handleSearch}
          className="mb-6 w-full rounded-md border border-border bg-light p-2 text-dark"
        />

        {filteredChallenges.length > 0 ? (
          <ul className="space-y-4">
            {filteredChallenges.map((challenge) => (
              <li
                key={challenge.id}
                className="rounded-md bg-light p-4 shadow-xl"
              >
                <h2 className="text-xl font-semibold">{challenge.title}</h2>
                <p className="text-grayText">{challenge.description}</p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-sm font-semibold ${
                    challenge.difficulty === 'Easy' &&
                    'bg-green-200 text-green-800'
                  } ${
                    challenge.difficulty === 'Medium' &&
                    'bg-yellow-200 text-yellow-800'
                  } ${
                    challenge.difficulty === 'Hard' && 'bg-red-200 text-red-800'
                  } }`}
                >
                  {challenge.difficulty}
                </span>
                <a
                  href={'coding-challenges/' + challenge.id}
                  className="mt-2 block text-primary hover:text-primary2 hover:underline"
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
