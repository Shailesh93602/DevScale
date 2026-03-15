'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAxiosGet } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import { TableSkeleton } from './components/TableSkeleton';

const MyArticles = () => {
  const [articles, setArticles] = useState<
    { id: string; title: string; status: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [getArticles] = useAxiosGet<{
    success?: boolean;
    articles: { id: string; title: string; status: string }[];
    message?: string;
  }>('/articles/my-articles');

  useEffect(() => {
    const fetchMyArticles = async () => {
      setIsLoading(true);
      try {
        const response = await getArticles();
        if (response.data?.success) {
          setArticles(response.data.articles);
        } else {
          toast.error('Failed to load articles.');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Error fetching articles.');
      } finally {
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">My Articles</h1>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold text-foreground">My Articles</h1>

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No articles yet"
          description="You haven't written any articles yet. Start sharing your knowledge with the community!"
          actionLabel="Write an Article"
          onAction={() => router.push('/create-resource')}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {article.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-primary/10 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-primary">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(article.id)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleViewComments(article.id)}
                        variant="ghost"
                        size="sm"
                      >
                        View Comments
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyArticles;
