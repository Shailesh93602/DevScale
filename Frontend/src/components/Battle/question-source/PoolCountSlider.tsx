import { Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

function PoolStatus({
  poolLoading,
  poolError,
  totalAvailable,
  count,
}: {
  poolLoading: boolean;
  poolError?: boolean;
  totalAvailable: number | null;
  count: number;
}) {
  if (poolLoading) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Checking pool...
      </span>
    );
  }
  if (poolError) {
    return (
      <span role="alert" className="text-xs font-medium text-destructive">
        Could not check the question pool — try again
      </span>
    );
  }
  if (totalAvailable === null) return null;
  const enough = totalAvailable >= count;
  return (
    <span
      className={cn(
        'text-xs font-medium',
        enough ? 'text-green-600' : 'text-warning',
      )}
    >
      {enough
        ? `${totalAvailable} questions available`
        : `Only ${totalAvailable} available — lower count recommended`}
    </span>
  );
}

export function PoolCountSlider({
  count,
  setCount,
  maxCount,
  poolLoading,
  poolError,
  totalAvailable,
}: {
  count: number;
  setCount: (count: number) => void;
  maxCount: number;
  poolLoading: boolean;
  poolError?: boolean;
  totalAvailable: number | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Questions: {count}</label>
        <PoolStatus
          poolLoading={poolLoading}
          poolError={poolError}
          totalAvailable={totalAvailable}
          count={count}
        />
      </div>
      <Slider
        min={5}
        max={maxCount}
        step={5}
        value={[count]}
        onValueChange={([v]) => setCount(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5</span>
        <span>{maxCount}</span>
      </div>
    </div>
  );
}
