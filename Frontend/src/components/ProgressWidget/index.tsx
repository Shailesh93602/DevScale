'use client';
type ProgressData = {
  chapters: number;
  items: number;
  completedChapters: number;
  completedItems: number;
};

export default function ProgressWidget({
  initialData,
}: {
  initialData: ProgressData;
}) {
  const calculateProgress = (): number => {
    const totalCompleted =
      initialData.completedChapters + initialData.completedItems;
    const totalItems = initialData.chapters + initialData.items;
    return Math.round((totalCompleted / totalItems) * 100);
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-md">
      <h3 className="mb-4 text-xl font-semibold text-card-foreground">
        Learning Progress
      </h3>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Chapters</span>
          <span className="text-foreground">
            {initialData.completedChapters}/{initialData.chapters}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Practice Items</span>
          <span className="text-foreground">
            {initialData.completedItems}/{initialData.items}
          </span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-right">
            <span className="inline-block text-xs font-semibold text-blue">
              {calculateProgress()}%
            </span>
          </div>
        </div>
        <div className="mb-4 flex h-2 overflow-hidden rounded bg-muted text-xs">
          <div
            style={{ width: `${calculateProgress()}%` }}
            className="flex flex-col justify-center whitespace-nowrap bg-blue text-center text-white shadow-none transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}
