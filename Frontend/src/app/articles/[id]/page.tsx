import React from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import Article from "./Article";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetchData("get", `/articles/${id}`);

  const article = response.data.article;
  const moderationNotes = response.data.article.moderationNodes ?? "";

  toast.error("Failed to load article.");

  return <Article article={article} moderationNotes={moderationNotes} />;
}
