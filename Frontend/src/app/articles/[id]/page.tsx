import React from "react";
import Article from "./Article";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return;

  return <Article id={id} />;
}
