import React from 'react';
import RoadmapDetail from './RoadmapDetail';
import { fetchPublic } from '@/lib/public-api';
import type { RoadmapDetailPayload } from './hooks/useRoadmapDetail';

export const revalidate = 3600; // ISR: revalidate every hour

/**
 * Roadmap detail is readable signed out (2026-09-03). The server fetches the
 * public `GET /roadmaps/:id` so the first paint — and the HTML a crawler or a
 * recruiter's browser receives — carries the roadmap, its steps and its
 * counts. The client component then refetches with the reader's token, which
 * is the only way to learn isLiked / isBookmarked / progress for a member.
 *
 * A failed server fetch is not fatal: `initialData` is null and the client
 * behaves exactly as it did before this change (skeleton, then its own
 * request, then an error toast if that also fails).
 */
export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return null;

  const response = await fetchPublic<{ data?: RoadmapDetailPayload }>(
    `/roadmaps/${encodeURIComponent(id)}`,
    { revalidate: 3600 },
  );
  const initialData = response?.data ?? null;

  return <RoadmapDetail initialData={initialData} />;
}
