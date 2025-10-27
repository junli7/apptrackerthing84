
import React, { useMemo } from 'react';
import { Tag } from '../types';
import SearchIcon from './icons/SearchIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ListBulletIcon from './icons/ListBulletIcon';
import ViewColumnsIcon from './icons/ViewColumnsIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';

type SortByType = 'deadline-asc' | 'schoolName-asc' | 'schoolName-desc' | 'doneness-asc' | 'doneness-desc';
type EssaySortByType = 'deadline-asc' | 'schoolName-asc' | 'wordCount-asc' | 'wordCount-desc';
type ViewType = 'list' | 'board' | 'essays';

interface ControlsProps {
  currentView: ViewType;
  onSetView: (view: ViewType) => void;
  sortBy: SortByType;
  onSortByChange: (value: SortByType) => void;
  essaySortBy: EssaySortByType;
  onEssaySortByChange: (value: EssaySortByType) => void;
  onRefreshSort: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  essayTags: Tag[];
  schoolTags: Tag[];
  filterTagId: string | null;
  onFilterTagIdChange: (tagId: string | null) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExportToDocx: () => void;
  resultsCount: number;
}

const ViewSwitcher: React.FC<{ currentView: ViewType, onSetView: (view: ViewType) => void }> = ({ currentView, onSetView }) => {
    const views: { id: ViewType, name: string, icon: React.FC<any> }[] = [
        { id: 'list', name: 'List', icon: ListBulletIcon },
        { id: 'board', name: 'Board', icon: ViewColumnsIcon },
        { id: 'essays', name: 'Essays', icon: GraduationCapIcon },
    ];
    return (
        <div className="flex items-center p-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onSetView(view.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        currentView === view.id
                            ? 'bg-white text-zinc-800 shadow-sm dark:bg-zinc-600 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-600/50'
                    }`}
                    aria-current={currentView === view.id}
                >
                    <view.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{view.name}</span>
                </button>
            ))}
        </div>
    );
};

const Controls: React.FC<ControlsProps> = (props) => {
  const { currentView, onSetView, sortBy, onSortByChange, essaySortBy, onEssaySortByChange, onRefreshSort, searchQuery, onSearchQueryChange, essayTags, schoolTags, filterTagId, onFilterTagIdChange, onExpandAll, onCollapseAll, onExportToDocx, resultsCount } = props;
  const allTags = useMemo(() => [...schoolTags, ...essayTags].sort((a,b) => a.name.localeCompare(b.name)), [schoolTags, essayTags]);
  
  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between flex-wrap">
        <ViewSwitcher currentView={currentView} onSetView={onSetView} />
         <div className="relative w-full sm:flex-grow max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search schools, tags, essays..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md pl-10 pr-28 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Search applications"
          />
           {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
              </span>
            </div>
          )}
        </div>
      </div>
       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="filterTag" className="font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">Filter by Tag:</label>
            <select
              id="filterTag"
              value={filterTagId || ''}
              onChange={(e) => onFilterTagIdChange(e.target.value || null)}
              className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
            >
              <option value="">All Tags</option>
              <optgroup label="School Tags">
                {schoolTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
              </optgroup>
              <optgroup label="Essay Tags">
                {essayTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
              </optgroup>
            </select>
          </div>
          {currentView !== 'board' && (
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="sort" className="font-semibold text-zinc-600 dark:text-zinc-300">Sort by:</label>
                {currentView === 'list' && (
                    <select id="sort" value={sortBy} onChange={(e) => onSortByChange(e.target.value as SortByType)}
                        className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                        <option value="deadline-asc">Deadline (Soonest)</option>
                        <option value="schoolName-asc">School Name (A-Z)</option>
                        <option value="schoolName-desc">School Name (Z-A)</option>
                        <option value="doneness-asc">Doneness (Least to Most)</option>
                        <option value="doneness-desc">Doneness (Most to Least)</option>
                    </select>
                )}
                 {currentView === 'essays' && (
                    <select id="sort" value={essaySortBy} onChange={(e) => onEssaySortByChange(e.target.value as EssaySortByType)}
                        className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                        <option value="deadline-asc">Deadline (Soonest)</option>
                        <option value="schoolName-asc">School Name (A-Z)</option>
                        <option value="wordCount-asc">Word Count (Low-High)</option>
                        <option value="wordCount-desc">Word Count (High-Low)</option>
                    </select>
                )}
                 <button onClick={onRefreshSort}
                    className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all duration-150 active:scale-95 hover:rotate-12"
                    title="Refresh sort order">
                    <ArrowPathIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {currentView === 'list' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={onExpandAll} className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150">
                        Expand All
                    </button>
                    <button onClick={onCollapseAll} className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150">
                        Collapse All
                    </button>
                </div>
            )}
          <button
            onClick={onExportToDocx}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Export DOCX
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;