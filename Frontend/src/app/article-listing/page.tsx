'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';

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

  const [getAllArticles] = useAxiosGet<IArticle[]>('/articles/all');
  const [updateArticleStatus] = useAxiosPost<{
    id: string;
    status: string;
  }>('/articles/status');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await getAllArticles();
        setArticles(data ?? []);
        setFilteredArticles(data ?? []);
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
          (article) => article?.status === statusFilter,
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (article) =>
            article?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article?.content.toLowerCase().includes(searchTerm.toLowerCase()),
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
        articles?.map((article) =>
          article?.id === id ? { ...article, status: newStatus } : article,
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
    <div className="min-h-screen bg-background p-6">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">
        Articles List
      </h1>
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search articles..."
          className="flex-1 rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          aria-label="Filter articles by status"
          className="rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-md">
        <table className="min-w-full">
          <thead className="bg-muted">
            <tr className="text-left text-foreground">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Author</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr key={article?.id} className="border-b border-border">
                <td className="px-6 py-3 text-foreground">{article?.title}</td>
                <td className="px-6 py-3 text-muted-foreground">
                  {article?.author?.username}
                </td>
                <td
                  className={`px-6 py-3 ${
                    article?.status === 'approved' ? 'text-green' : ''
                  } ${article?.status === 'pending' ? 'text-yellow' : ''} ${article?.status === 'rejected' ? 'text-red' : ''} }`}
                >
                  {article?.status}
                </td>
                <td className="px-6 py-3 text-muted-foreground">
                  {new Date(article?.createdAt).toLocaleDateString()}
                </td>
                <td className="flex items-center space-x-4 px-6 py-3">
                  <Link
                    href={`/articles/${article?.id}`}
                    className="text-blue hover:underline"
                  >
                    View
                  </Link>
                  {article?.status === 'pending' ? (
                    <>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-green hover:underline"
                        onClick={() =>
                          handleUpdateStatus(article?.id, 'approved')
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-red hover:underline"
                        onClick={() =>
                          handleUpdateStatus(article?.id, 'rejected')
                        }
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleEdit(article?.id)}
                      className="mr-2"
                      size="sm"
                    >
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredArticles?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center text-muted-foreground"
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
