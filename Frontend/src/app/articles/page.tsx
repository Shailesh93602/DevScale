'use client';
import React, { useEffect, useState } from 'react';
import { fetchData } from '@/app/services/fetchData';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const MyArticles = () => {
  const [articles, setArticles] = useState<
    { id: string; title: string; status: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const response = await fetchData('get', `/articles/my-articles`);
        if (response.data.success) {
          setArticles(response.data.articles);
        } else {
          toast.error('Failed to load articles.');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Error fetching articles.');
      }
    };

    fetchMyArticles();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/edit-article/${id}`);
  };

  const handleViewComments = (id: string) => {
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
        <h1 className="mb-6 text-3xl font-bold">My Articles</h1>
        <table className="w-full table-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
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
                    className="mr-2 rounded-lg bg-blue-500 px-3 py-1 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewComments(article.id)}
                    className="rounded-lg bg-gray-500 px-3 py-1 text-white"
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
