'use client';

import { useEffect, useState } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { useAxiosGet } from '@/hooks/useAxios';
import type { Post, User } from './components/communityTypes';
import {
  CommunityUsersCard,
  UpcomingEventsCard,
} from './components/CommunitySidebar';
import { CommunityFeed } from './components/CommunityFeed';

function CommunitySkeleton() {
  return (
    <BattleZoneLayout>
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <Skeleton className="h-[400px]" />
          </div>
          <div className="space-y-4 md:col-span-2">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </div>
    </BattleZoneLayout>
  );
}

export default function CommunityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [getUsers] = useAxiosGet<User[]>('/users');
  const [getPosts] = useAxiosGet<Post[]>('/forums/posts');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          getUsers(),
          getPosts(),
        ]);

        if (usersResponse.data) {
          setUsers(usersResponse.data || []);
        }

        if (postsResponse.data) {
          setPosts(postsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch community data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) return <CommunitySkeleton />;

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">
            Connect with other battle participants and share your experiences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6">
            <CommunityUsersCard
              users={filteredUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <UpcomingEventsCard />
          </div>

          <CommunityFeed posts={posts} />
        </div>
      </div>
    </BattleZoneLayout>
  );
}
