import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Filter,
  FolderTree,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RoadmapDashboardState } from './useRoadmapDashboard';

const TABS = [
  { value: 'discover', label: 'Discover', icon: Sparkles },
  { value: 'enrolled', label: 'Enrolled', icon: BookOpen },
  { value: 'created', label: 'Created', icon: FolderTree },
  { value: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'enrolled', label: 'Most Enrolled' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

type S = RoadmapDashboardState;

export function RoadmapTabsBar({ s }: { s: S }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TabsList className="w-full sm:w-auto">
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-2">
            <Icon size={16} />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex items-center gap-2">
        <Select value={s.sortBy} onValueChange={s.handleSortChange}>
          <SelectTrigger className="w-[140px]" aria-label="Sort Roadmaps">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="View Settings">
              <Settings size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Grid View</DropdownMenuItem>
            <DropdownMenuItem>List View</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg p-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-full bg-muted"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
      </div>
      <div className="h-4 w-4 animate-pulse rounded bg-muted"></div>
    </div>
  );
}

function CategoryList({ s }: { s: S }) {
  if (s.isCategoriesLoading) {
    return (
      <>
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <CategoryRowSkeleton key={index} />
          ))}
      </>
    );
  }
  return (
    <>
      {s.categories.map((category) => {
        const selected = s.selectedCategories.includes(category.id);
        return (
          <div
            key={category.id}
            className={`group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-accent ${
              selected ? 'bg-primary/10 text-primary' : ''
            }`}
            onClick={() => s.handleCategoryChange(category.id)}
          >
            <div className="flex items-center gap-2">
              {category.icon && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <i className={category.icon} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            <CheckCircle2
              className={`h-4 w-4 ${
                selected ? 'text-primary' : 'invisible group-hover:visible'
              }`}
            />
          </div>
        );
      })}
    </>
  );
}

function CategoryMenu({ s }: { s: S }) {
  const count = s.selectedCategories.length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          Categories
          {count > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Categories</h4>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={s.handleClearCategories}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              <CategoryList s={s} />
            </div>
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectedCategoryPills({ s }: { s: S }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {s.selectedCategories.map((categoryId) => {
        const category = s.categories.find((c) => c.id === categoryId);
        return (
          <Badge
            key={categoryId}
            variant="secondary"
            className="gap-1 px-2 py-1"
          >
            {category?.name || 'Category'}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                s.handleRemoveCategory(categoryId);
              }}
              className="ml-1 h-3.5 w-3.5 rounded-full p-0 hover:bg-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </Badge>
        );
      })}
    </div>
  );
}

export function RoadmapSearchBar({ s }: { s: S }) {
  return (
    <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roadmaps..."
            className="pl-10"
            onChange={(e) => s.handleSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={s.difficultyFilter}
            onValueChange={s.handleDifficultyChange}
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label="Filter by Difficulty"
            >
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CategoryMenu s={s} />
        </div>
      </div>

      {s.selectedCategories.length > 0 && <SelectedCategoryPills s={s} />}
    </div>
  );
}
