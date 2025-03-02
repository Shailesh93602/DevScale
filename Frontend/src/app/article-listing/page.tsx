'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';

interface IArticle {
  id: string;
  status: string;
  title: string;
  content: string;
  author: { username: string };
  createdAt: string;
}

const ArticleListPage = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<
    {
      id: string;
      status: string;
      title: string;
      content: string;
      author: { username: string };
      createdAt: string;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [getAllArticles] = useAxiosGet<{
    articles: typeof articles;
  }>('/articles/all');
  const [updateArticleStatus] = useAxiosPost<{
    id: string;
    status: string;
  }>('/articles/status');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await getAllArticles();
        setArticles(data?.articles ?? []);
        setFilteredArticles(data?.articles ?? []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const filterArticles = () => {
      let filtered = articles;

      if (statusFilter) {
        filtered = filtered.filter(
          (article) => article.status === statusFilter,
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setFilteredArticles(filtered);
    };

    filterArticles();
  }, [statusFilter, searchTerm, articles]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateArticleStatus({ id, status: newStatus });
      setArticles(
        articles.map((article) =>
          article.id === id ? { ...article, status: newStatus } : article,
        ),
      );
    } catch (error) {
      console.error(`Error updating article status:`, error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/edit-article/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 dark:text-gray-100">
        Articles List
      </h1>
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search articles..."
          className="flex-1 rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr className="text-left text-gray-900 dark:text-gray-100">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Author</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr
                key={article.id}
                className="border-b border-gray-200 dark:border-gray-600"
              >
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
                  {article.title}
                </td>
                <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                  {article.author.username}
                </td>
                <td
                  className={`px-6 py-3 ${
                    article.status === 'approved' ? 'text-green-500' : ''
                  } ${article.status === 'pending' ? 'text-yellow-500' : ''} ${article.status === 'rejected' ? 'text-red-500' : ''} }`}
                >
                  {article.status}
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td className="flex items-center space-x-4 px-6 py-3">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-blue-500 hover:underline dark:text-blue-300"
                  >
                    View
                  </Link>
                  {article.status === 'pending' ? (
                    <>
                      <button
                        className="text-green-500 hover:underline dark:text-green-300"
                        onClick={() =>
                          handleUpdateStatus(article.id, 'approved')
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="text-red-500 dark:text-red-300 hover:underline"
                        onClick={() =>
                          handleUpdateStatus(article.id, 'rejected')
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(article.id)}
                      className="mr-2 rounded-lg bg-blue-500 px-3 py-1 text-white"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredArticles?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
