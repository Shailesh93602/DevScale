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
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Learning Progress
      </h3>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Chapters</span>
          <span className="text-gray-800 dark:text-gray-200">
            {initialData.completedChapters}/{initialData.chapters}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Practice Items
          </span>
          <span className="text-gray-800 dark:text-gray-200">
            {initialData.completedItems}/{initialData.items}
          </span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-right">
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
              {calculateProgress()}%
            </span>
          </div>
        </div>
        <div className="mb-4 flex h-2 overflow-hidden rounded bg-gray-200 text-xs dark:bg-gray-700">
          <div
            style={{ width: `${calculateProgress()}%` }}
            className="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none transition-all duration-300 dark:bg-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
