
import React from 'react';

interface ProgressItemProps {
  label: string;
  completed: number;
  total: number;
}

const ProgressItem: React.FC<ProgressItemProps> = ({ label, completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex-1 min-w-[200px] w-full">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
          {completed} / {total}
        </span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
        <div
          className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label}
        ></div>
      </div>
    </div>
  );
};


interface ProgressTrackerProps {
  completedEssays: number;
  totalEssays: number;
  submittedApplications: number;
  totalApplications: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedEssays,
  totalEssays,
  submittedApplications,
  totalApplications,
}) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between flex-wrap">
      <ProgressItem label="Essays Completed" completed={completedEssays} total={totalEssays} />
      <ProgressItem label="Applications Submitted" completed={submittedApplications} total={totalApplications} />
    </div>
  );
};

export default ProgressTracker;
