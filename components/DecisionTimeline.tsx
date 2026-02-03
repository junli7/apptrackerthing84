import React, { useMemo } from 'react';
import { Application, Outcome } from '../types';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ClockIcon from './icons/ClockIcon';
import XMarkIcon from './icons/XMarkIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';

interface DecisionTimelineProps {
  applications: Application[];
  onSelectApplication: (appId: string) => void;
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const formatFullDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  applications,
  onSelectApplication,
}) => {
  // Filter and sort applications with decision dates
  const timelineItems = useMemo(() => {
    return applications
      .filter(app => app.decisionDate && app.outcome !== Outcome.IN_PROGRESS && app.outcome !== Outcome.SUBMITTED)
      .sort((a, b) => new Date(a.decisionDate!).getTime() - new Date(b.decisionDate!).getTime());
  }, [applications]);

  const getOutcomeConfig = (outcome: Outcome) => {
    switch (outcome) {
      case Outcome.ACCEPTED:
        return {
          icon: CheckBadgeIcon,
          color: 'bg-green-500',
          textColor: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case Outcome.REJECTED:
        return {
          icon: XMarkIcon,
          color: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      case Outcome.WAITLISTED:
        return {
          icon: ClockIcon,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
        };
      case Outcome.DEFERRED:
        return {
          icon: ClockIcon,
          color: 'bg-amber-500',
          textColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          icon: ClockIcon,
          color: 'bg-zinc-500',
          textColor: 'text-zinc-600 dark:text-zinc-400',
          bgColor: 'bg-zinc-50 dark:bg-zinc-800/50',
          borderColor: 'border-zinc-200 dark:border-zinc-700',
        };
    }
  };

  if (timelineItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-md animate-fadeInUp">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDaysIcon className="h-6 w-6 text-indigo-500" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Decision Timeline</h3>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

        {/* Timeline items */}
        <div className="space-y-4">
          {timelineItems.map((app, index) => {
            const config = getOutcomeConfig(app.outcome);
            const Icon = config.icon;

            return (
              <div
                key={app.id}
                className="relative pl-12 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon dot */}
                <div className={`absolute left-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-md`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Content card */}
                <button
                  onClick={() => onSelectApplication(app.id)}
                  className={`w-full text-left p-4 rounded-xl border ${config.borderColor} ${config.bgColor} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        {app.schoolName}
                      </h4>
                      <p className={`text-sm font-medium ${config.textColor}`}>
                        {app.outcome}
                      </p>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatFullDate(app.decisionDate!)}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DecisionTimeline;
