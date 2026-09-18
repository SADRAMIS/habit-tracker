export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`} />;
}

export function SkeletonGoalCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl shadow-md p-5 bg-white dark:bg-gray-800 animate-pulse">
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
      <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
    </div>
  );
}

export function SkeletonHistoryItem() {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 py-2 animate-pulse">
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}