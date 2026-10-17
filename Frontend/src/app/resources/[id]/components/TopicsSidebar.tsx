import { motion } from 'framer-motion';
import { CheckCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ResourceType } from './resourceTypes';

export function ResourcesSkeleton() {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="w-full border-r border-border p-5 md:w-3/12 lg:w-2/12">
        <Skeleton className="mb-6 h-8 w-3/4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="w-full p-5 md:w-9/12 md:p-10 lg:w-10/12">
        <Skeleton className="mb-10 mt-5 h-16 w-3/4" />
        <div className="space-y-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  topics: ResourceType[];
  selectedTopicId: string | undefined;
  onSelect: (topic: ResourceType) => void;
  isDesktop: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

/** Mobile toggle, backdrop and the topic list (a drawer below lg). */
export function TopicsSidebar({
  topics,
  selectedTopicId,
  onSelect,
  isDesktop,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  return (
    <>
      {/* Mobile toggle - hidden on desktop via both CSS and JS */}
      <Button
        className={cn(
          'fixed left-4 top-[70px] z-50 h-10 w-10 rounded-full bg-primary/90 p-0 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-primary lg:hidden',
          isDesktop && 'hidden',
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.div
        initial={false}
        animate={{ x: isDesktop ? 0 : sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full w-[280px] border-r border-border bg-card p-6 shadow-2xl transition-all duration-300',
          'lg:sticky lg:top-[60px] lg:z-10 lg:h-[calc(100vh-60px)] lg:w-[280px] lg:flex-none lg:translate-x-0 lg:bg-background lg:shadow-none xl:w-[300px]',
          !isDesktop && 'overflow-y-auto',
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Topics
          </h2>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/80 hover:text-foreground lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <ul className="space-y-2">
          {topics.map((topic) => {
            const selected = selectedTopicId === topic?.topic?.id;
            return (
              <li
                key={topic?.id}
                className={`group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                  selected
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
                onClick={() => {
                  onSelect(topic);
                  setSidebarOpen(false);
                }}
              >
                <span className="truncate pr-2 text-sm font-semibold">
                  {topic?.topic?.title}
                </span>
                {topic?.topic?.isCompleted && (
                  <CheckCircle
                    size={16}
                    className={selected ? 'text-white' : 'text-primary'}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </>
  );
}
