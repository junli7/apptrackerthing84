import React, { useState, useMemo } from 'react';
import { Application, Tag, Outcome } from '../types';
import ScaleIcon from './icons/ScaleIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import MapPinIcon from './icons/MapPinIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import XMarkIcon from './icons/XMarkIcon';
import PlusIcon from './icons/PlusIcon';

interface CompareViewProps {
  applications: Application[];
  tagsById: Record<string, Tag>;
  onUpdateApplication: (app: Application) => void;
  onSelectApplication: (appId: string) => void;
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

// Component for adding/editing pros and cons
const ProConEditor: React.FC<{
  items: string[];
  type: 'pro' | 'con';
  onUpdate: (items: string[]) => void;
}> = ({ items, type, onUpdate }) => {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const colorClass = type === 'pro'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
  const bgClass = type === 'pro'
    ? 'bg-green-50 dark:bg-green-900/20'
    : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className={`flex items-start gap-2 p-2 rounded-lg ${bgClass} group`}>
          {type === 'pro' ? (
            <PlusCircleIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
          ) : (
            <MinusCircleIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
          )}
          <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-grow">{item}</span>
          <button
            onClick={() => handleRemove(index)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-opacity"
          >
            <XMarkIcon className="h-3 w-3 text-zinc-500" />
          </button>
        </div>
      ))}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add a ${type}...`}
            className="flex-grow px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewItem(''); }}
            className="px-3 py-1.5 text-sm font-medium bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`flex items-center gap-1 text-sm ${colorClass} hover:underline`}
        >
          <PlusIcon className="h-3 w-3" />
          Add {type}
        </button>
      )}
    </div>
  );
};

// Individual school comparison card
const CompareCard: React.FC<{
  application: Application;
  tagsById: Record<string, Tag>;
  onUpdate: (app: Application) => void;
  onRemove: () => void;
  netCost: number;
  isLowestCost?: boolean;
  isMostAid?: boolean;
}> = ({ application, tagsById, onUpdate, onRemove, netCost, isLowestCost, isMostAid }) => {
  const tags = (application.tagIds || []).map(id => tagsById[id]).filter(Boolean);

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-2xl border-2 ${isLowestCost ? 'border-green-400 dark:border-green-600 ring-2 ring-green-400/20' : 'border-zinc-200 dark:border-zinc-700'} shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-5 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full blur-lg" />

        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          title="Remove from comparison"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Best value badges */}
        {isLowestCost && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold flex items-center gap-1">
            <span className="text-yellow-300">★</span> Best Value
          </div>
        )}

        <h3 className="text-xl font-bold pr-8 mt-4 relative">{application.schoolName}</h3>
        {application.location && (
          <p className="text-sm text-green-100 flex items-center gap-1.5 mt-2 relative">
            <MapPinIcon className="h-4 w-4" />
            {application.location.city}, {application.location.state}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow space-y-4">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span
                key={tag.id}
                className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${tag.color}-100 text-${tag.color}-700 dark:bg-${tag.color}-900/50 dark:text-${tag.color}-300`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Cost Section */}
        <div className="p-4 bg-gradient-to-br from-zinc-50 to-slate-50 dark:from-zinc-700/50 dark:to-slate-800/30 rounded-xl border border-zinc-200/50 dark:border-zinc-600/30">
          <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <CurrencyDollarIcon className="h-4 w-4 text-white" />
            </div>
            Cost Breakdown
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Tuition/Year</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {application.tuitionCost ? formatCurrency(application.tuitionCost) : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-400">Financial Aid</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {application.financialAid ? `-${formatCurrency(application.financialAid)}` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-600">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Net Cost</span>
              <span className={`font-bold text-lg ${isLowestCost ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-white'}`}>
                {formatCurrency(netCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Response Deadline */}
        {application.responseDeadline && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <CalendarDaysIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Response Deadline</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(application.responseDeadline)}</p>
            </div>
          </div>
        )}

        {/* Pros */}
        <div>
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5" />
            Pros
          </h4>
          <ProConEditor
            items={application.pros || []}
            type="pro"
            onUpdate={(pros) => onUpdate({ ...application, pros })}
          />
        </div>

        {/* Cons */}
        <div>
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <XMarkIcon className="h-5 w-5" />
            Cons
          </h4>
          <ProConEditor
            items={application.cons || []}
            type="con"
            onUpdate={(cons) => onUpdate({ ...application, cons })}
          />
        </div>

        {/* Notes */}
        {application.notes && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl">
            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Notes</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{application.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// School selector dropdown
const SchoolSelector: React.FC<{
  availableSchools: Application[];
  onSelect: (appId: string) => void;
}> = ({ availableSchools, onSelect }) => {
  if (availableSchools.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-2xl">
        <p className="text-zinc-500 dark:text-zinc-400 text-center px-4">
          No more accepted schools to compare
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-2xl p-6">
      <PlusIcon className="h-12 w-12 text-zinc-400 mb-4" />
      <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-4">Add school to compare</p>
      <select
        onChange={(e) => e.target.value && onSelect(e.target.value)}
        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
        defaultValue=""
      >
        <option value="" disabled>Select a school...</option>
        {availableSchools.map(app => (
          <option key={app.id} value={app.id}>{app.schoolName}</option>
        ))}
      </select>
    </div>
  );
};

const CompareView: React.FC<CompareViewProps> = ({
  applications,
  tagsById,
  onUpdateApplication,
  onSelectApplication,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter to only accepted schools
  const acceptedSchools = useMemo(() =>
    applications.filter(app => app.outcome === Outcome.ACCEPTED),
    [applications]
  );

  const selectedSchools = useMemo(() =>
    selectedIds.map(id => acceptedSchools.find(app => app.id === id)).filter(Boolean) as Application[],
    [selectedIds, acceptedSchools]
  );

  const availableSchools = useMemo(() =>
    acceptedSchools.filter(app => !selectedIds.includes(app.id)),
    [acceptedSchools, selectedIds]
  );

  const handleAddSchool = (appId: string) => {
    if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, appId]);
    }
  };

  const handleRemoveSchool = (appId: string) => {
    setSelectedIds(selectedIds.filter(id => id !== appId));
  };

  const calculateNetCost = (app: Application): number => {
    const tuition = app.tuitionCost || 0;
    const aid = app.financialAid || 0;
    return tuition - aid;
  };

  // Find best values for highlighting
  const bestValues = useMemo(() => {
    if (selectedSchools.length === 0) return { lowestCost: null, mostAid: null };

    const costs = selectedSchools.map(app => calculateNetCost(app));
    const aids = selectedSchools.map(app => app.financialAid || 0);

    return {
      lowestCost: Math.min(...costs),
      mostAid: Math.max(...aids),
    };
  }, [selectedSchools]);

  if (acceptedSchools.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm animate-fadeIn">
        <ScaleIcon className="mx-auto h-12 w-12 text-zinc-400" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">
          No Acceptances to Compare
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
          Once you receive acceptance decisions, you can compare schools side-by-side here to help make your final choice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <ScaleIcon className="h-7 w-7 text-indigo-500" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Compare Acceptances</h2>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Compare up to 4 schools side-by-side. Add pros and cons to help make your decision.
        </p>

        {/* Quick stats */}
        {selectedSchools.length >= 2 && bestValues.lowestCost !== null && (
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
            <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Quick Comparison</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Lowest Net Cost</p>
                <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(bestValues.lowestCost)}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Highest Aid Offered</p>
                <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(bestValues.mostAid)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className={`grid gap-6 ${
        selectedSchools.length === 0 ? 'grid-cols-1' :
        selectedSchools.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
        selectedSchools.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        selectedSchools.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
      }`}>
        {selectedSchools.map(app => {
          const appNetCost = calculateNetCost(app);
          const appAid = app.financialAid || 0;
          return (
            <CompareCard
              key={app.id}
              application={app}
              tagsById={tagsById}
              onUpdate={onUpdateApplication}
              onRemove={() => handleRemoveSchool(app.id)}
              netCost={appNetCost}
              isLowestCost={selectedSchools.length >= 2 && appNetCost === bestValues.lowestCost}
              isMostAid={selectedSchools.length >= 2 && appAid === bestValues.mostAid && appAid > 0}
            />
          );
        })}

        {selectedIds.length < 4 && (
          <SchoolSelector
            availableSchools={availableSchools}
            onSelect={handleAddSchool}
          />
        )}
      </div>
    </div>
  );
};

export default CompareView;
