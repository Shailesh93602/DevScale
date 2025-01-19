import React from "react";
import { toast } from "react-toastify";
import { fetchData } from "@/app/services/fetchData";
import EditArticle from "./EditArticle";

export default async function ArticleEditor({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) return;

  const response = await fetchData("get", `/articles/${id}`);
  if (!response?.data?.success) {
    toast.error("Failed to load article.");
  }

  return <EditArticle id={id} content={response.data.article.content} />;
}
