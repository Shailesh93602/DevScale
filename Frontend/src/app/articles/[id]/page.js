"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content);
};

const ArticlePage = ({ params }) => {
  const { id } = params;
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        try {
          const response = await fetchData("get", `/articles/${id}`);
          if (response.data.success) {
            setArticle(response.data.article);
          } else {
            toast.error("Failed to load article.");
          }
        } catch (error) {
          console.error("Error fetching article:", error);
          toast.error("Error fetching article.");
        }
      };

      fetchArticle();
    }
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-white">
            By {article.author.username}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(article.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <p
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(article.content),
            }}
          ></p>
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
