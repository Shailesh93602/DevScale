import React from 'react';
import EditArticle from './EditArticle';

export default async function ArticleEditor({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) return;

  return <EditArticle id={id} />;
}
