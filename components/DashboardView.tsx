
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


const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string, animationDelay: number }> = ({ icon, title, value, description, animationDelay }) => (
  <div style={{animationDelay: `${animationDelay}ms`}} className="group bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700/50 flex items-start gap-4 animate-fadeInUp transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
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
       <div className="text-center py-20 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm animate-fadeIn">
        <GraduationCapIcon className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">Welcome to your Application Tracker!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Get started by adding your first school application using the "Add School" button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<BuildingLibraryIcon className="h-6 w-6 text-green-700 dark:text-green-300" />} title="Total Applications" value={stats.totalApplications} description="Schools you're tracking" animationDelay={0}/>
        <StatCard icon={<PaperAirplaneIcon className="h-6 w-6 text-green-700 dark:text-green-300" />} title="Applications Submitted" value={stats.submittedApplications} description="Successfully sent" animationDelay={100}/>
        <StatCard icon={<DocumentDuplicateIcon className="h-6 w-6 text-green-700 dark:text-green-300" />} title="Total Essays" value={stats.totalEssays} description="Prompts to write" animationDelay={200}/>
        <StatCard icon={<CheckBadgeIcon className="h-6 w-6 text-green-700 dark:text-green-300" />} title="Essays Completed" value={stats.completedEssays} description="Ready for submission" animationDelay={300}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-lg" style={{animationDelay: '400ms'}}>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            Upcoming Deadlines
          </h3>
          <div className="mt-4 space-y-3 max-h-[28rem] overflow-y-auto pr-2">
            {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(app => (
                    <button key={app.id} onClick={() => onSelectApplication(app.id)} className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-l-4 hover:border-l-8 hover:translate-x-2 transform ${getDaysRemainingColor(app.daysRemaining)}`}>
                        <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{app.schoolName}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(app.deadline + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                        </div>
                        <p className={`text-sm font-bold shrink-0 ml-4 ${app.daysRemaining <= 7 ? 'text-red-600 dark:text-red-400' : app.daysRemaining <= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {`${app.daysRemaining} ${app.daysRemaining === 1 ? 'day' : 'days'} left`}
                        </p>
                    </button>
                ))
            ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No upcoming deadlines. You're all caught up!</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-lg" style={{animationDelay: '500ms'}}>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                    <ChartPieIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                    Application Status
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                        <DonutChart data={chartData} total={stats.totalApplications} />
                    </div>
                    <div className="flex-grow w-full">
                        <div className="text-center sm:text-left mb-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Applications</p>
                            <p className="text-4xl font-bold text-green-700 dark:text-green-500">{stats.totalApplications}</p>
                        </div>
                        <div className="space-y-2 w-full">
                            {chartData.map(item => item.value > 0 && (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${item.colorClass}`}></span>
                                        <span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
                                    </div>
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-100">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700/50 animate-fadeInUp transition-shadow duration-300 hover:shadow-lg" style={{animationDelay: '600ms'}}>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                    <TagIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                    Essay Progress by Tag
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {essayTagProgress.length > 0 ? essayTagProgress.map(item => {
                        const percentage = item.total > 0 ? (item.completed / item.total) * 100 : 0;
                        return (
                             <div key={item.tag.id}>
                                <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                                    <span>{item.tag.name}</span>
                                    <span>{item.completed} / {item.total}</span>
                                </div>
                                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                                    <div
                                        className={`${TAG_BG_CLASSES[item.tag.color as TagColor]} h-2 rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    }) : <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">No tagged essays to track.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;