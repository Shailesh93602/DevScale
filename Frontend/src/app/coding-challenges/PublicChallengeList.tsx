import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { LogIn, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './styles.css';

/**
 * The signed-out view of /coding-challenges. Server component: the catalogue
 * is in the HTML. Each card's action is "Sign in to solve", which lands on the
 * login page with a callbackUrl straight back to that challenge's editor —
 * the write (opening the editor, submitting) is what needs the account, not
 * the reading.
 */

export interface PublicChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface PublicChallengeListProps {
  /** null = the API could not be reached; [] = it answered with nothing. */
  challenges: PublicChallenge[] | null;
  page: number;
  totalPages: number;
  total: number;
}

// Theme tokens, not palette shades: `text-emerald-700` on the dark card
// measured 2.75:1 in the first dark-mode audit of this page (2026-09-05).
// Tokens flip with the theme; the same check gives success 6.2/9.6 and red
// 7.0/5.5 (light/dark) on the card.
function difficultyClass(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return 'border border-success/20 bg-success/10 text-success';
    case 'MEDIUM':
      return 'border border-warning/20 bg-warning/10 text-warning';
    default:
      return 'border border-red/20 bg-red/10 text-red';
  }
}

function signInFor(challengeId: string): string {
  return `/auth/login?callbackUrl=${encodeURIComponent(`/coding-challenges/${challengeId}`)}`;
}

export function PublicChallengeList({
  challenges,
  page,
  totalPages,
  total,
}: PublicChallengeListProps) {
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Coding Challenges
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total > 0
                ? `${total} challenge${total === 1 ? '' : 's'} in the catalogue. Browse freely; sign in to open the editor and submit.`
                : 'Browse freely; sign in to open the editor and submit.'}
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/auth/login?callbackUrl=%2Fcoding-challenges">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to solve
            </Link>
          </Button>
        </div>

        {challenges === null && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border/50 bg-muted/10 py-24 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Challenges could not be loaded
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The API did not answer. Refresh in a moment — the list does not
              need an account.
            </p>
          </div>
        )}

        {challenges !== null && challenges.length === 0 && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border/50 bg-muted/10 py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Search
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              No challenges published yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is the real state of the catalogue, not a loading screen.
            </p>
          </div>
        )}

        {challenges !== null && challenges.length > 0 && (
          <>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <li
                  key={challenge.id}
                  className="flex flex-col rounded-lg border border-border bg-muted/30 p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-foreground">
                      {challenge.title}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider ${difficultyClass(challenge.difficulty)}`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="prose prose-sm mb-6 line-clamp-3 max-w-none flex-grow text-sm text-muted-foreground">
                    <ReactMarkdown>{challenge.description}</ReactMarkdown>
                  </div>
                  <Link
                    href={signInFor(challenge.id)}
                    className="hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Sign in to solve
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-4"
                aria-label="Challenge pages"
              >
                {page > 1 ? (
                  <Button asChild variant="outline">
                    <Link href={`/coding-challenges?page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Button asChild variant="outline">
                    <Link href={`/coding-challenges?page=${page + 1}`}>
                      Next
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Next
                  </Button>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
