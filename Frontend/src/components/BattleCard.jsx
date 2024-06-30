export default function BattleCard({ battle }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {battle.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {battle.description}
      </p>
      <div className="flex flex-wrap items-center mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
          Created by: {battle.username}
        </span>
        <span className="inline-block px-2 py-1 text-sm font-semibold rounded-full bg-blue-600 text-white mr-2">
          {battle.topic}
        </span>
        <span
          className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
            battle.difficulty === "easy"
              ? "bg-green-200 text-green-800"
              : battle.difficulty === "medium"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-200 text-red-800"
          } mr-2`}
        >
          {battle.difficulty}
        </span>
        <span
          className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
            battle.length === "short"
              ? "bg-green-200 text-green-800"
              : battle.length === "medium"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {battle.length}
        </span>
      </div>
    </div>
  );
}
