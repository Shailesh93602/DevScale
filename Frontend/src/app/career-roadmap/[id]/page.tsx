import React from 'react';
import RoadmapDetail from './RoadmapDetail';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return null;

  // Warm the Next.js data cache for this roadmap (ISR).
  // The client component hydrates its own data with auth context.
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  void fetch(`${baseUrl}/roadmaps/${id}`, { next: { revalidate: 3600 } }).catch(
    () => {},
  );

  return <RoadmapDetail />;
}
