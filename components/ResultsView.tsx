import React, { useMemo, useState } from 'react';
import { Application, Tag, Outcome } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import SparklesIcon from './icons/SparklesIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ClockIcon from './icons/ClockIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import XMarkIcon from './icons/XMarkIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import DecisionTimeline from './DecisionTimeline';

interface ResultsViewProps {
  applications: Application[];
  tagsById: Record<string, Tag>;
  onSelectApplication: (appId: string) => void;
  onUpdateApplication: (app: Application) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

// Confetti animation component for acceptances
const Confetti: React.FC = () => {
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Summary stat card
const StatBadge: React.FC<{
  icon: React.ReactNode;
  count: number;
  label: string;
  colorClass: string;
  bgClass: string;
  gradientClass?: string;
}> = ({ icon, count, label, colorClass, bgClass, gradientClass }) => (
  <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${bgClass} transition-all duration-300 hover:scale-105 hover:shadow-lg border border-transparent ${gradientClass ? 'hover:border-current/10' : ''}`}>
    <div className={`${colorClass} p-2 rounded-xl bg-white/50 dark:bg-black/20`}>{icon}</div>
    <div>
      <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
    </div>
  </div>
);

// Individual result card for each application
const ResultCard: React.FC<{
  application: Application;
  tagsById: Record<string, Tag>;
  onSelect: () => void;
  onUpdateFinancialAid: (amount: number | undefined) => void;
  onUpdateDecisionDate: (date: string | undefined) => void;
}> = ({ application, tagsById, onSelect, onUpdateFinancialAid, onUpdateDecisionDate }) => {
  const [isEditingAid, setIsEditingAid] = useState(false);
  const [aidInput, setAidInput] = useState(application.financialAid?.toString() || '');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState(application.decisionDate || '');

  const getOutcomeStyles = () => {
    switch (application.outcome) {
      case Outcome.ACCEPTED:
        return {
          border: 'border-green-300 dark:border-green-600',
          bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-teal-900/20',
          icon: <CheckBadgeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />,
          badge: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25',
          glow: 'shadow-green-200/50 dark:shadow-green-900/30 hover:shadow-green-300/60 dark:hover:shadow-green-800/40',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
        };
      case Outcome.WAITLISTED:
        return {
          border: 'border-yellow-300 dark:border-yellow-600',
          bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/40 dark:via-amber-900/30 dark:to-orange-900/20',
          icon: <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />,
          badge: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/25',
          glow: 'shadow-yellow-200/50 dark:shadow-yellow-900/30 hover:shadow-yellow-300/60 dark:hover:shadow-yellow-800/40',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
        };
      case Outcome.DEFERRED:
        return {
          border: 'border-amber-300 dark:border-amber-600',
          bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/20',
          icon: <ClockIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
          badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25',
          glow: 'shadow-amber-200/50 dark:shadow-amber-900/30 hover:shadow-amber-300/60 dark:hover:shadow-amber-800/40',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
        };
      case Outcome.REJECTED:
        return {
          border: 'border-red-200 dark:border-red-600',
          bg: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/40 dark:via-rose-900/30 dark:to-pink-900/20',
          icon: <XMarkIcon className="h-8 w-8 text-red-600 dark:text-red-400" />,
          badge: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25',
          glow: 'shadow-red-200/50 dark:shadow-red-900/30 hover:shadow-red-300/60 dark:hover:shadow-red-800/40',
          iconBg: 'bg-red-100 dark:bg-red-900/50',
        };
      default:
        return {
          border: 'border-zinc-200 dark:border-zinc-600',
          bg: 'bg-gradient-to-br from-zinc-50 via-slate-50 to-gray-50 dark:from-zinc-800/50 dark:via-slate-800/40 dark:to-gray-800/30',
          icon: <ClockIcon className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />,
          badge: 'bg-gradient-to-r from-zinc-500 to-slate-600 text-white shadow-lg shadow-zinc-500/25',
          glow: 'shadow-zinc-200/50 dark:shadow-zinc-900/30',
          iconBg: 'bg-zinc-100 dark:bg-zinc-700/50',
        };
    }
  };

  const styles = getOutcomeStyles();
  const tags = (application.tagIds || []).map(id => tagsById[id]).filter(Boolean);
  const isDecided = [Outcome.ACCEPTED, Outcome.REJECTED, Outcome.WAITLISTED, Outcome.DEFERRED].includes(application.outcome);

  const handleSaveAid = () => {
    const amount = aidInput ? parseFloat(aidInput.replace(/[^0-9.]/g, '')) : undefined;
    onUpdateFinancialAid(isNaN(amount as number) ? undefined : amount);
    setIsEditingAid(false);
  };

  const handleSaveDate = () => {
    onUpdateDecisionDate(dateInput || undefined);
    setIsEditingDate(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} p-5 transition-all duration-300 hover:shadow-xl ${styles.glow} hover:-translate-y-1.5 cursor-pointer group`}
      onClick={onSelect}
    >
      {application.outcome === Outcome.ACCEPTED && <Confetti />}

      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      {/* Outcome badge */}
      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold ${styles.badge}`}>
        {application.outcome}
      </div>

      {/* Main content */}
      <div className="flex items-start gap-4 relative">
        <div className={`flex-shrink-0 p-2.5 rounded-xl ${styles.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {styles.icon}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate pr-24 group-hover:text-zinc-700 dark:group-hover:text-zinc-100 transition-colors">
            {application.schoolName}
          </h3>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium bg-${tag.color}-100 text-${tag.color}-700 dark:bg-${tag.color}-900/50 dark:text-${tag.color}-300`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Decision details */}
      {isDecided && (
        <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Decision Date */}
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Decision Date:</span>
            {isEditingDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleSaveDate}
                  className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDate(false)}
                  className="px-2 py-1 text-xs font-semibold bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-sm text-zinc-700 dark:text-zinc-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {application.decisionDate ? formatDate(application.decisionDate) : 'Add date'}
              </button>
            )}
          </div>

          {/* Financial Aid - only show for acceptances */}
          {application.outcome === Outcome.ACCEPTED && (
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Financial Aid:</span>
              {isEditingAid ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aidInput}
                    onChange={(e) => setAidInput(e.target.value)}
                    placeholder="e.g., 50000"
                    className="w-28 px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleSaveAid}
                    className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingAid(false)}
                    className="px-2 py-1 text-xs font-semibold bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded hover:bg-zinc-400 dark:hover:bg-zinc-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingAid(true)}
                  className="text-sm font-semibold text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {application.financialAid ? `${formatCurrency(application.financialAid)}/yr` : 'Add amount'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sparkle decoration for acceptances */}
      {application.outcome === Outcome.ACCEPTED && (
        <SparklesIcon className="absolute bottom-2 right-2 h-6 w-6 text-green-400/50 animate-pulse" />
      )}
    </div>
  );
};

// Section for each outcome category
const ResultsSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  applications: Application[];
  tagsById: Record<string, Tag>;
  onSelectApplication: (appId: string) => void;
  onUpdateApplication: (app: Application) => void;
  bgClass: string;
  borderClass: string;
  emptyMessage: string;
}> = ({ title, icon, applications, tagsById, onSelectApplication, onUpdateApplication, bgClass, borderClass, emptyMessage }) => {
  if (applications.length === 0) return null;

  return (
    <div className={`rounded-2xl border ${borderClass} ${bgClass} p-6 animate-fadeInUp`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          {title}
          <span className="ml-2 text-base font-normal text-zinc-500 dark:text-zinc-400">
            ({applications.length})
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {applications.map((app) => (
          <ResultCard
            key={app.id}
            application={app}
            tagsById={tagsById}
            onSelect={() => onSelectApplication(app.id)}
            onUpdateFinancialAid={(amount) =>
              onUpdateApplication({ ...app, financialAid: amount })
            }
            onUpdateDecisionDate={(date) =>
              onUpdateApplication({ ...app, decisionDate: date })
            }
          />
        ))}
      </div>
    </div>
  );
};

const ResultsView: React.FC<ResultsViewProps> = ({
  applications,
  tagsById,
  onSelectApplication,
  onUpdateApplication,
}) => {
  const categorized = useMemo(() => {
    const accepted = applications.filter((app) => app.outcome === Outcome.ACCEPTED);
    const waitlisted = applications.filter((app) => app.outcome === Outcome.WAITLISTED);
    const deferred = applications.filter((app) => app.outcome === Outcome.DEFERRED);
    const rejected = applications.filter((app) => app.outcome === Outcome.REJECTED);
    const pending = applications.filter(
      (app) =>
        app.outcome === Outcome.IN_PROGRESS ||
        app.outcome === Outcome.SUBMITTED
    );

    return { accepted, waitlisted, deferred, rejected, pending };
  }, [applications]);

  const totalAid = useMemo(() => {
    return categorized.accepted.reduce((sum, app) => sum + (app.financialAid || 0), 0);
  }, [categorized.accepted]);

  const hasDecisions = categorized.accepted.length > 0 ||
    categorized.waitlisted.length > 0 ||
    categorized.deferred.length > 0 ||
    categorized.rejected.length > 0;

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm animate-fadeIn">
        <TrophyIcon className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">
          No Applications Yet
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Add schools to start tracking your application results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Stats */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <TrophyIcon className="h-7 w-7 text-amber-500" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Decision Summary</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <StatBadge
            icon={<CheckBadgeIcon className="h-6 w-6" />}
            count={categorized.accepted.length}
            label="Accepted"
            colorClass="text-green-600 dark:text-green-400"
            bgClass="bg-green-50 dark:bg-green-900/30"
          />
          <StatBadge
            icon={<ClockIcon className="h-6 w-6" />}
            count={categorized.waitlisted.length}
            label="Waitlisted"
            colorClass="text-yellow-600 dark:text-yellow-400"
            bgClass="bg-yellow-50 dark:bg-yellow-900/30"
          />
          <StatBadge
            icon={<ClockIcon className="h-6 w-6" />}
            count={categorized.deferred.length}
            label="Deferred"
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-50 dark:bg-amber-900/30"
          />
          <StatBadge
            icon={<XMarkIcon className="h-6 w-6" />}
            count={categorized.rejected.length}
            label="Rejected"
            colorClass="text-red-600 dark:text-red-400"
            bgClass="bg-red-50 dark:bg-red-900/30"
          />
          <StatBadge
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
            count={categorized.pending.length}
            label="Awaiting"
            colorClass="text-zinc-600 dark:text-zinc-400"
            bgClass="bg-zinc-100 dark:bg-zinc-700/50"
          />
          {totalAid > 0 && (
            <StatBadge
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              count={0}
              label={`${formatCurrency(totalAid)}/yr in Aid`}
              colorClass="text-emerald-600 dark:text-emerald-400"
              bgClass="bg-emerald-50 dark:bg-emerald-900/30"
            />
          )}
        </div>
      </div>

      {/* Decision Timeline */}
      <DecisionTimeline
        applications={applications}
        onSelectApplication={onSelectApplication}
      />

      {/* Results by Category */}
      {!hasDecisions ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md animate-fadeIn">
          <ClockIcon className="mx-auto h-12 w-12 text-zinc-400 animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">
            Waiting for Decisions
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            You have {categorized.pending.length} application{categorized.pending.length !== 1 ? 's' : ''} awaiting decisions.
            Update the outcome in the List or Board view when you hear back!
          </p>
        </div>
      ) : (
        <>
          <ResultsSection
            title="Accepted"
            icon={<CheckBadgeIcon className="h-7 w-7 text-green-600 dark:text-green-400" />}
            applications={categorized.accepted}
            tagsById={tagsById}
            onSelectApplication={onSelectApplication}
            onUpdateApplication={onUpdateApplication}
            bgClass="bg-green-50/50 dark:bg-green-900/10"
            borderClass="border-green-200 dark:border-green-800"
            emptyMessage="No acceptances yet"
          />

          <ResultsSection
            title="Waitlisted"
            icon={<ClockIcon className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />}
            applications={categorized.waitlisted}
            tagsById={tagsById}
            onSelectApplication={onSelectApplication}
            onUpdateApplication={onUpdateApplication}
            bgClass="bg-yellow-50/50 dark:bg-yellow-900/10"
            borderClass="border-yellow-200 dark:border-yellow-800"
            emptyMessage="No waitlisted applications"
          />

          <ResultsSection
            title="Deferred"
            icon={<ClockIcon className="h-7 w-7 text-amber-600 dark:text-amber-400" />}
            applications={categorized.deferred}
            tagsById={tagsById}
            onSelectApplication={onSelectApplication}
            onUpdateApplication={onUpdateApplication}
            bgClass="bg-amber-50/50 dark:bg-amber-900/10"
            borderClass="border-amber-200 dark:border-amber-800"
            emptyMessage="No deferred applications"
          />

          <ResultsSection
            title="Rejected"
            icon={<XMarkIcon className="h-7 w-7 text-red-600 dark:text-red-400" />}
            applications={categorized.rejected}
            tagsById={tagsById}
            onSelectApplication={onSelectApplication}
            onUpdateApplication={onUpdateApplication}
            bgClass="bg-red-50/50 dark:bg-red-900/10"
            borderClass="border-red-200 dark:border-red-800"
            emptyMessage="No rejections"
          />
        </>
      )}

      {/* Pending section */}
      {categorized.pending.length > 0 && (
        <ResultsSection
          title="Awaiting Decision"
          icon={<ExclamationTriangleIcon className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />}
          applications={categorized.pending}
          tagsById={tagsById}
          onSelectApplication={onSelectApplication}
          onUpdateApplication={onUpdateApplication}
          bgClass="bg-zinc-50/50 dark:bg-zinc-800/50"
          borderClass="border-zinc-200 dark:border-zinc-700"
          emptyMessage="All decisions received!"
        />
      )}
    </div>
  );
};

export default ResultsView;
