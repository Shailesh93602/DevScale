import React from 'react';
import RoadmapDetail from './RoadmapDetail';

export const revalidate = 3600; // ISR: revalidate every hour

async function getRoadmapData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const url = `${baseUrl}/roadmaps/${id}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.success ? json.data : undefined;
  } catch (error) {
    console.error('Error fetching roadmap for ISR:', error);
    return undefined;
  }
}

export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return null;

  // Pre-fetch roadmap data on the server for ISR/SEO
  const _initialData = await getRoadmapData(id);

  // The client component handles all interactive features
  // We pass the ID; the client component fetches its own data
  // since it needs auth context for enrollment/social actions
  return <RoadmapDetail />;
}
