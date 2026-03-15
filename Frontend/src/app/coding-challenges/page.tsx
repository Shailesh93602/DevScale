'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './styles.css';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  ChallengeListSkeleton,
  ChallengeSkeleton,
} from './components/ChallengeSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';

interface IChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export default function CodingChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [challenges, setChallenges] = useState<IChallenge[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [getChallenges] = useAxiosGet<IChallenge[]>('/challenges');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchChallenges = async (currentPage: number, search: string) => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await getChallenges({
        params: {
          page: currentPage,
          search: search,
          limit: 12
        },
      });
      const data = response.data;
      const pagination = response.meta?.pagination;

      if (data) {
        setChallenges((prevChallenges) => {
          const newChallenges = data ?? [];
          return currentPage === 1 ? newChallenges : [...prevChallenges, ...newChallenges];
        });
        setHasMore(currentPage < (pagination?.totalPages ?? 0));
      }
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      setError((error as { message: string }).message);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      setChallenges([]);
      fetchChallenges(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchChallenges(page, searchTerm);
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


  return (
    <div className="container mx-auto p-4 py-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Coding Challenges
        </h1>

        <div className="relative mx-auto mb-8 max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search challenges by title..."
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search coding challenges"
            className="w-full rounded-2xl border border-border/50 bg-background/50 py-3 pl-12 pr-4 text-sm text-foreground shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load challenges: {error}
            </AlertDescription>
          </Alert>
        )}

        {challenges.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <li
                key={challenge.id}
                className="flex flex-col rounded-lg border border-border bg-muted/30 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    {challenge.title}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                      challenge.difficulty.toUpperCase() === 'EASY'
                        ? 'bg-success/20 text-success'
                        : challenge.difficulty.toUpperCase() === 'MEDIUM'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="mb-6 line-clamp-3 flex-grow text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{challenge.description}</ReactMarkdown>
                </div>
                <Link
                  href={`/coding-challenges/${challenge.id}`}
                  className="hover:bg-primary/90 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors"
                >
                  Solve Challenge
                </Link>
              </li>
            ))}
          </ul>
        ) : !isFetching ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border/50 bg-muted/10 py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-muted-foreground/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No challenges found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn't find anything matching "{searchTerm}". Try adjusting
              your search terms.
            </p>
          </div>
        ) : null}

        {isFetching && (
          <div className="mt-8">
            {page === 1 ? (
              <ChallengeListSkeleton />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ChallengeSkeleton />
                <ChallengeSkeleton />
                <ChallengeSkeleton />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
