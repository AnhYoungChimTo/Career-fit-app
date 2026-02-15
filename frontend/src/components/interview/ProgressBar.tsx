interface ProgressBarProps {
  current: number;
  total: number;
  categoryName?: string;
}

export default function ProgressBar({ current, total, categoryName }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          {categoryName && (
            <span className="text-sm font-medium text-gray-700">{categoryName}</span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">
          Question {current} of {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-gray-500">{percentage}% complete</span>
      </div>
    </div>
  );
}
