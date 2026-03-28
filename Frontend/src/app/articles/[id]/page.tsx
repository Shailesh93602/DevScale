import React from 'react';
import Article from './Article';

export const revalidate = 3600; // ISR: revalidate every hour

async function getArticle(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const url = `${baseUrl}/articles/${id}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.success ? json.data : undefined;
  } catch (error) {
    console.error('Error fetching article for ISR:', error);
    return undefined;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return null;

  const initialData = await getArticle(id);

  return <Article id={id} initialData={initialData} />;
}
