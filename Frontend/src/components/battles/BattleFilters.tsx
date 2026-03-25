import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BattleFilters as BattleFiltersType } from '@/types/battle';

interface BattleFiltersProps {
  filters: BattleFiltersType;
  onFilterChange: (key: keyof BattleFiltersType, value: string) => void;
  onReset: () => void;
}

export const BattleFilters = ({
  filters,
  onFilterChange,
  onReset,
}: BattleFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-background p-4 shadow">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search battles..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="startDate">Start Date</SelectItem>
            <SelectItem value="prize">Prize</SelectItem>
            <SelectItem value="participants">Participants</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortOrder}
          onValueChange={(value) => onFilterChange('sortOrder', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full sm:w-auto"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
