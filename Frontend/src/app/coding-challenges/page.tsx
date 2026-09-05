import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { hasSupabaseSessionCookie } from '@/lib/session-cookie';
import { fetchPublic, type PublicListResponse } from '@/lib/public-api';
import ChallengesBrowser from './ChallengesBrowser';
import {
  PublicChallengeList,
  type PublicChallenge,
} from './PublicChallengeList';

/**
 * /coding-challenges — the LIST is readable without an account since
 * 2026-09-03; solving (/coding-challenges/<id>) is still gated.
 *
 * Same shape as /career-roadmap: no session cookie → server-rendered list
 * from the public `GET /challenges`; a session cookie → the existing client
 * browser with live search and pagination. See lib/session-cookie.ts for why
 * the switch is a cookie check and not a getUser() round-trip.
 */

export const metadata: Metadata = {
  title: 'Coding Challenges',
  description:
    'Browse the coding challenge catalogue without an account. Sign in to open the editor, run your code and submit.',
  alternates: { canonical: '/coding-challenges' },
};

export const revalidate = 120;

const PAGE_SIZE = 12;

function parsePage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export default async function CodingChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  if (hasSupabaseSessionCookie(cookieStore.getAll())) {
    return <ChallengesBrowser />;
  }

  const page = parsePage((await searchParams).page);
  const result = await fetchPublic<PublicListResponse<PublicChallenge>>(
    `/challenges?page=${page}&limit=${PAGE_SIZE}`,
    { revalidate: 120 },
  );

  return (
    <PublicChallengeList
      challenges={result ? (result.data ?? []) : null}
      page={page}
      totalPages={result?.meta?.totalPages ?? 0}
      total={result?.meta?.total ?? 0}
    />
  );
}
