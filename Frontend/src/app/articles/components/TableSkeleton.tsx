import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-[100px]" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-[60px]" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-[80px]" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-[200px]" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-[60px] rounded-full" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-[60px] rounded-md" />
                  <Skeleton className="h-8 w-[120px] rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
