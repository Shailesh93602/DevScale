"use client";
import React, { useEffect, useState } from "react";
import { fetchData } from "@/app/services/fetchData";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const response = await fetchData("get", `/articles/my-articles`);
        if (response.data.success) {
          setArticles(response.data.articles);
        } else {
          toast.error("Failed to load articles.");
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Error fetching articles.");
      }
    };

    fetchMyArticles();
  }, []);

  const handleEdit = (id) => {
    router.push(`/editArticle/${id}`);
  };

  const handleViewComments = (id) => {
    router.push(`/viewComments/${id}`);
  };

  if (articles.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6">
          <p>No articles found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Articles</h1>
        <table className="table-auto w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="border px-4 py-2">{article.title}</td>
                <td className="border px-4 py-2">{article.status}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(article.id)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-lg mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewComments(article.id)}
                    className="bg-gray-500 text-white py-1 px-3 rounded-lg"
                  >
                    View Comments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MyArticles;
