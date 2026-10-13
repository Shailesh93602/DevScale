import type { ComponentType } from 'react';
import { Search, Swords, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserListItem } from './UserListItem';
import type { User } from './communityTypes';

function UserTab({ value, users }: { value: string; users: User[] }) {
  return (
    <TabsContent value={value} className="m-0 space-y-4">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </TabsContent>
  );
}

export function CommunityUsersCard({
  users,
  searchTerm,
  onSearchChange,
}: {
  users: User[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Battle Community</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="bg-green-500 h-2 w-2 rounded-full"></div>
            <span>42 Online</span>
          </Badge>
        </div>
        <CardDescription>Find and connect with other battlers</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="online">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="top">Top Players</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px] px-6 py-4">
            <UserTab
              value="online"
              users={users.filter((user) => user.is_online)}
            />
            <UserTab
              value="friends"
              users={users.filter((user) => user.is_friend)}
            />
            <UserTab
              value="top"
              users={users
                .toSorted((a, b) => (b.rank || 0) - (a.rank || 0))
                .slice(0, 10)}
            />
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const EVENTS: {
  title: string;
  when: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { title: 'Weekend Tournament', when: 'Saturday, 2pm', icon: Swords },
  { title: 'Community Meetup', when: 'Sunday, 3pm', icon: Users },
];

export function UpcomingEventsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Join these community events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {EVENTS.map(({ title, when, icon: Icon }) => (
          <div key={title} className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{when}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Join Event
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
