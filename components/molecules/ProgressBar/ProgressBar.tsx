interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-send-button h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-black/70 mt-1">処理中... {percentage}%</p>
      )}
    </div>
  );
}
