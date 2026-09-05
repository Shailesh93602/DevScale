import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { hasSupabaseSessionCookie } from '@/lib/session-cookie';
import { fetchPublic, type PublicListResponse } from '@/lib/public-api';
import type { RoadmapType } from '@/components/Roadmap/RoadmapCard';
import RoadmapDashboard from './RoadmapDashboard';
import { PublicRoadmaps } from './PublicRoadmaps';

/**
 * /career-roadmap — readable without an account since 2026-09-03.
 *
 * Two trees behind one URL:
 *
 *   - a visitor with no session cookie gets PublicRoadmaps, SERVER-RENDERED
 *     from the public `GET /roadmaps` endpoint. The HTML a recruiter or a
 *     crawler receives has the roadmaps in it, not a spinner and a login wall.
 *   - a request carrying a Supabase session cookie gets the existing client
 *     dashboard (tabs, filters, create modal, infinite scroll), unchanged.
 *
 * The switch is a cookie check, not a network call — see lib/session-cookie.ts
 * for why. It is a rendering decision only: every write on either tree is
 * still authorised by the backend per request.
 */

export const metadata: Metadata = {
  title: 'Career Roadmaps',
  description:
    'Structured, step-by-step engineering roadmaps — browse them without an account, enrol when you are ready.',
  alternates: { canonical: '/career-roadmap' },
};

// Anonymous HTML is cached and revalidated; the member dashboard reads cookies
// and is therefore dynamic. `revalidate` applies to the public fetches below.
export const revalidate = 300;

async function loadPublicRoadmaps() {
  const [featured, trending] = await Promise.all([
    fetchPublic<PublicListResponse<RoadmapType>>(
      '/roadmaps?type=featured&limit=6',
    ),
    fetchPublic<PublicListResponse<RoadmapType>>(
      '/roadmaps?type=trending&limit=9&sort=popular',
    ),
  ]);
  return {
    // null (not []) when the API could not be reached, so the page can say so.
    featured: featured ? (featured.data ?? []) : null,
    trending: trending ? (trending.data ?? []) : null,
  };
}

export default async function CareerRoadmapPage() {
  const cookieStore = await cookies();
  if (hasSupabaseSessionCookie(cookieStore.getAll())) {
    return <RoadmapDashboard />;
  }

  const { featured, trending } = await loadPublicRoadmaps();
  return <PublicRoadmaps featured={featured} trending={trending} />;
}
