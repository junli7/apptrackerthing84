
import React, { useMemo, useState, useEffect } from 'react';
import { Application, Essay, Tag, Outcome, TagColor } from '../types';
import { OUTCOME_OPTIONS, OUTCOME_BG_CLASSES_SOLID, TAG_BG_CLASSES } from '../constants';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import TagIcon from './icons/TagIcon';

// A reusable component for the Donut Chart
const DonutChart: React.FC<{ data: { label: string; value: number; colorClass: string }[], total: number }> = ({ data, total }) => {
    const radius = 60;
    const strokeWidth = 20;
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100); // delay to trigger transition
        return () => clearTimeout(timer);
    }, []);

    let accumulatedPercentage = 0;

    return (
        <div className="relative w-40 h-40">
            <svg viewBox="0 0 140 140" className="transform -rotate-90">
                <circle cx="70" cy="70" r={innerRadius} fill="transparent" strokeWidth={strokeWidth} className="stroke-current text-zinc-200 dark:text-zinc-700" />
                {data.map((segment) => {
                    if (segment.value === 0) return null;
                    const percentage = segment.value / total;
                    const finalOffset = circumference * (1 - percentage);
                    const rotation = accumulatedPercentage * 360;
                    accumulatedPercentage += percentage;

                    return (
                        <circle
                            key={segment.label}
                            cx="70" cy="70" r={innerRadius} fill="transparent"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ 
                                strokeDashoffset: isMounted ? finalOffset : circumference,
                                transform: `rotate(${rotation}deg)`, 
                                transformOrigin: '50% 50%',
                                transition: 'stroke-dashoffset 1s ease-out',
                            }}
                            className={`${segment.colorClass.replace('bg-', 'stroke-')}`}
                        />
                    );
                })}
            </svg>
        </div>
    );
};


// Gradient backgrounds for stat cards
const STAT_GRADIENTS = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600',
];

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  animationDelay: number;
  gradientIndex?: number;
}> = ({ icon, title, value, description, animationDelay, gradientIndex = 0 }) => (
  <div
    style={{animationDelay: `${animationDelay}ms`}}
    className="group relative bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 flex items-start gap-4 animate-fadeInUp transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
  >
    {/* Decorative gradient corner */}
    <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${STAT_GRADIENTS[gradientIndex % 4]} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

    <div className={`relative bg-gradient-to-br ${STAT_GRADIENTS[gradientIndex % 4]} p-3.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-white' })}
    </div>
    <div className="relative">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
    </div>
  </div>
);

const DashboardView: React.FC<{
  applications: Application[];
  essays: Essay[];
  tagsById: Record<string, Tag>;
  onSelectApplication: (appId: string) => void;
}> = ({ applications, essays, tagsById, onSelectApplication }) => {
  const stats = useMemo(() => {
    const totalApplications = applications.length;
    const submittedApplications = applications.filter(app => app.outcome !== Outcome.IN_PROGRESS && app.outcome !== Outcome.WITHDRAWN).length;
    const totalEssays = essays.length;
    const completedEssays = essays.filter(e => e.completed).length;
    return { totalApplications, submittedApplications, totalEssays, completedEssays };
  }, [applications, essays]);

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return applications
      .filter(app => app.outcome !== Outcome.WITHDRAWN)
      .map(app => ({...app, daysRemaining: Math.ceil((new Date(app.deadline + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}))
      .filter(app => app.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [applications]);

  const chartData = useMemo(() => {
    const counts = applications.reduce((acc, app) => {
      acc[app.outcome] = (acc[app.outcome] || 0) + 1;
      return acc;
    }, {} as Record<Outcome, number>);
    return OUTCOME_OPTIONS.map(outcome => ({
        label: outcome,
        value: counts[outcome] || 0,
        colorClass: OUTCOME_BG_CLASSES_SOLID[outcome],
    }));
  }, [applications]);

  const essayTagProgress = useMemo(() => {
    const progress: Record<string, { completed: number; total: number }> = {};
    essays.forEach(essay => {
        essay.tagIds.forEach(tagId => {
            if (!progress[tagId]) {
                progress[tagId] = { completed: 0, total: 0 };
            }
            progress[tagId].total++;
            if (essay.completed) {
                progress[tagId].completed++;
            }
        });
    });
    return Object.entries(progress)
        .map(([tagId, data]) => ({ tag: tagsById[tagId], ...data }))
        .filter(item => item.tag)
        // Fix: Corrected typo from `b.name` to `b.tag.name` to properly sort by tag name.
        .sort((a, b) => a.tag.name.localeCompare(b.tag.name));
  }, [essays, tagsById]);

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return 'border-red-500';
    if (days <= 30) return 'border-amber-500';
    return 'border-zinc-300 dark:border-zinc-600';
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 px-8 bg-gradient-to-br from-white to-green-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 animate-fadeIn">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 p-6 rounded-full">
            <GraduationCapIcon className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
          Welcome to your Application Tracker!
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
          Start your college application journey by adding your first school. Track deadlines, essays, and decisions all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <CheckBadgeIcon className="h-5 w-5 text-green-500" />
            <span>Track deadlines</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <DocumentDuplicateIcon className="h-5 w-5 text-blue-500" />
            <span>Manage essays</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <ChartPieIcon className="h-5 w-5 text-purple-500" />
            <span>View analytics</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<BuildingLibraryIcon />} title="Total Applications" value={stats.totalApplications} description="Schools you're tracking" animationDelay={0} gradientIndex={0} />
        <StatCard icon={<PaperAirplaneIcon />} title="Applications Submitted" value={stats.submittedApplications} description="Successfully sent" animationDelay={100} gradientIndex={1} />
        <StatCard icon={<DocumentDuplicateIcon />} title="Total Essays" value={stats.totalEssays} description="Prompts to write" animationDelay={200} gradientIndex={2} />
        <StatCard icon={<CheckBadgeIcon />} title="Essays Completed" value={stats.completedEssays} description="Ready for submission" animationDelay={300} gradientIndex={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-xl" style={{animationDelay: '400ms'}}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length > 0 && (
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {upcomingDeadlines.length} deadline{upcomingDeadlines.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-2 scrollbar-hide">
            {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((app, index) => {
                  const urgencyClass = app.daysRemaining <= 7
                    ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : app.daysRemaining <= 30
                    ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                    : 'border-l-zinc-300 dark:border-l-zinc-600 bg-zinc-50/50 dark:bg-zinc-700/30';

                  return (
                    <button
                      key={app.id}
                      onClick={() => onSelectApplication(app.id)}
                      className={`w-full flex justify-between items-center p-4 rounded-xl text-left transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-green-500 border-l-4 hover:shadow-md hover:-translate-y-0.5 ${urgencyClass}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{app.schoolName}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {new Date(app.deadline + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                            </p>
                        </div>
                        <div className={`shrink-0 ml-4 px-3 py-1.5 rounded-lg text-sm font-bold ${
                          app.daysRemaining <= 7
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : app.daysRemaining <= 30
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}>
                            {app.daysRemaining === 0 ? 'Today!' : `${app.daysRemaining} day${app.daysRemaining === 1 ? '' : 's'}`}
                        </div>
                    </button>
                  );
                })
            ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                    <CheckBadgeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">No upcoming deadlines</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">You're all caught up!</p>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-xl" style={{animationDelay: '500ms'}}>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                      <ChartPieIcon className="h-5 w-5 text-white" />
                    </div>
                    Application Status
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 relative">
                        <DonutChart data={chartData} total={stats.totalApplications} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalApplications}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
                          </div>
                        </div>
                    </div>
                    <div className="flex-grow w-full">
                        <div className="space-y-2.5 w-full">
                            {chartData.map(item => item.value > 0 && (
                                <div key={item.label} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`w-3.5 h-3.5 rounded-full ${item.colorClass} ring-2 ring-white dark:ring-zinc-800`}></span>
                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-xl" style={{animationDelay: '600ms'}}>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl">
                      <TagIcon className="h-5 w-5 text-white" />
                    </div>
                    Essay Progress by Tag
                </h3>
                <div className="space-y-4 max-h-44 overflow-y-auto pr-2 scrollbar-hide">
                    {essayTagProgress.length > 0 ? essayTagProgress.map(item => {
                        const percentage = item.total > 0 ? (item.completed / item.total) * 100 : 0;
                        return (
                             <div key={item.tag.id} className="group">
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.tag.name}</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">
                                      {item.completed}<span className="text-zinc-400 dark:text-zinc-500 font-normal">/{item.total}</span>
                                    </span>
                                </div>
                                <div className="relative w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`${TAG_BG_CLASSES[item.tag.color as TagColor]} h-2.5 rounded-full transition-all duration-700 ease-out relative`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                      {percentage === 100 && (
                                        <span className="absolute inset-0 bg-white/30 animate-shimmer" />
                                      )}
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                      <div className="text-center py-6">
                        <TagIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No tagged essays to track</p>
                      </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;