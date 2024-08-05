"use client";
import React, { useState, useEffect } from "react";
import { fetchData } from "../services/fetchData";

const ArticleListPage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetchData("get", "/articles/all");
        setArticles(response.data.articles);
        setFilteredArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const filterArticles = () => {
      let filtered = articles;

      if (statusFilter) {
        filtered = filtered.filter(
          (article) => article.status === statusFilter
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredArticles(filtered);
    };

    filterArticles();
  }, [statusFilter, searchTerm, articles]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetchData(
        "post",
        "/articles/status/?id=" + id + "&status=" + newStatus
      );
      setArticles(
        articles.map((article) =>
          article.id === id ? { ...article, status: newStatus } : article
        )
      );
    } catch (error) {
      console.error(`Error updating article status:`, error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Articles List
      </h1>
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search articles..."
          className="border border-gray-300 dark:border-gray-600 rounded-md p-2 flex-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr className="text-left text-gray-900 dark:text-gray-100">
              <th className="py-3 px-6">Title</th>
              <th className="py-3 px-6">Author</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr
                key={article.id}
                className="border-b border-gray-200 dark:border-gray-600"
              >
                <td className="py-3 px-6 text-gray-900 dark:text-gray-100">
                  {article.title}
                </td>
                <td className="py-3 px-6 text-gray-700 dark:text-gray-300">
                  {article.author.username}
                </td>
                <td
                  className={`py-3 px-6 ${
                    article.status === "approved"
                      ? "text-green-500"
                      : article.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {article.status}
                </td>
                <td className="py-3 px-6 text-gray-600 dark:text-gray-400">
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-6 flex items-center space-x-4">
                  {article.status === "pending" ? (
                    <>
                      <button
                        className="text-green-500 hover:underline dark:text-green-300"
                        onClick={() =>
                          handleUpdateStatus(article.id, "approved")
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="text-red-500 hover:underline dark:text-red-300"
                        onClick={() =>
                          handleUpdateStatus(article.id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No actions available
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredArticles?.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleListPage;
