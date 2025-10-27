import React, { useMemo } from 'react';
import { Application, Essay, Tag, Outcome } from '../types';
import { OUTCOME_OPTIONS, OUTCOME_COLORS } from '../constants';
import BuildingLibraryIcon from './icons/BuildingLibraryIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
// Fix: Import GraduationCapIcon to resolve reference error.
import GraduationCapIcon from './icons/GraduationCapIcon';

interface DashboardViewProps {
  applications: Application[];
  essays: Essay[];
  tagsById: Record<string, Tag>;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string }> = ({ icon, title, value, description }) => (
  <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm flex items-start gap-4 animate-fadeInUp">
    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ applications, essays, tagsById }) => {
  const stats = useMemo(() => {
    const totalApplications = applications.length;
    const submittedApplications = applications.filter(app => app.outcome !== Outcome.IN_PROGRESS && app.outcome !== Outcome.WITHDRAWN).length;
    const totalEssays = essays.length;
    const completedEssays = essays.filter(e => e.completed).length;
    return { totalApplications, submittedApplications, totalEssays, completedEssays };
  }, [applications, essays]);

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    return applications
      .filter(app => app.outcome === Outcome.IN_PROGRESS)
      .map(app => {
        const deadlineDate = new Date(app.deadline + 'T00:00:00');
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...app, daysRemaining: diffDays };
      })
      .filter(app => app.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 7);
  }, [applications]);

  const applicationsByOutcome = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.outcome] = (acc[app.outcome] || 0) + 1;
      return acc;
    }, {} as Record<Outcome, number>);
  }, [applications]);
  
  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return 'text-red-600 dark:text-red-400';
    if (days <= 30) return 'text-amber-600 dark:text-amber-400';
    return 'text-zinc-600 dark:text-zinc-300';
  };

  if (applications.length === 0) {
    return (
       <div className="text-center py-20 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm animate-fadeIn">
        <GraduationCapIcon className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">Welcome to your Application Tracker!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Get started by adding your first school application using the "Add School" button above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BuildingLibraryIcon className="h-6 w-6 text-green-700 dark:text-green-300" />}
          title="Total Applications"
          value={stats.totalApplications}
          description="Schools you're tracking"
        />
        <StatCard
          icon={<PaperAirplaneIcon className="h-6 w-6 text-green-700 dark:text-green-300" />}
          title="Applications Submitted"
          value={stats.submittedApplications}
          description="Successfully sent"
        />
        <StatCard
          icon={<DocumentDuplicateIcon className="h-6 w-6 text-green-700 dark:text-green-300" />}
          title="Total Essays"
          value={stats.totalEssays}
          description="Prompts to write"
        />
        <StatCard
          icon={<CheckBadgeIcon className="h-6 w-6 text-green-700 dark:text-green-300" />}
          title="Essays Completed"
          value={stats.completedEssays}
          description="Ready for submission"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm animate-fadeInUp" style={{animationDelay: '100ms'}}>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            Upcoming Deadlines
          </h3>
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(app => (
                    <div key={app.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-md">
                        <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{app.schoolName}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(app.deadline + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                        </div>
                        <p className={`text-sm font-bold ${getDaysRemainingColor(app.daysRemaining)}`}>
                            {app.daysRemaining} {app.daysRemaining === 1 ? 'day' : 'days'} left
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No upcoming deadlines for in-progress applications. You're all caught up!</p>
            )}
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm animate-fadeInUp" style={{animationDelay: '200ms'}}>
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Application Status</h3>
           <div className="mt-4 space-y-4">
            {OUTCOME_OPTIONS.map(outcome => {
                const count = applicationsByOutcome[outcome] || 0;
                if (count === 0 && outcome !== Outcome.IN_PROGRESS) return null; // Hide empty statuses unless it's 'In Progress'
                const percentage = stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0;
                return (
                    <div key={outcome}>
                        <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                            <span>{outcome}</span>
                            <span>{count} / {stats.totalApplications}</span>
                        </div>
                         <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                            <div
                                className={`${OUTCOME_COLORS[outcome].split(' ')[0]} h-2.5 rounded-full`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )
            })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;