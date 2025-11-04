
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Tag } from '../types';
import SearchIcon from './icons/SearchIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ListBulletIcon from './icons/ListBulletIcon';
import ViewColumnsIcon from './icons/ViewColumnsIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import FunnelIcon from './icons/FunnelIcon';
import TagComponent from './Tag';

type SortByType = 'deadline-asc' | 'schoolName-asc' | 'schoolName-desc' | 'doneness-asc' | 'doneness-desc';
type EssaySortByType = 'deadline-asc' | 'schoolName-asc' | 'wordCount-asc' | 'wordCount-desc';
type ViewType = 'dashboard' | 'list' | 'board' | 'essays';

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
  filterTagIds: string[];
  onFilterTagIdsChange: (tagIds: string[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExportToDocx: () => void;
  resultsCount: number;
}

const ViewSwitcher: React.FC<{ currentView: ViewType, onSetView: (view: ViewType) => void }> = ({ currentView, onSetView }) => {
    const views: { id: ViewType, name: string, icon: React.FC<any> }[] = [
        { id: 'dashboard', name: 'Dashboard', icon: ChartPieIcon },
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
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ease-in-out transform active:scale-95 ${
                        currentView === view.id
                            ? 'bg-white text-zinc-800 shadow-sm dark:bg-zinc-600 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-600/60 hover:text-zinc-800 dark:hover:text-zinc-100'
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

const TagFilter: React.FC<{
    schoolTags: Tag[];
    essayTags: Tag[];
    selectedTagIds: string[];
    onToggleTag: (tagId: string) => void;
    onClear: () => void;
}> = ({ schoolTags, essayTags, selectedTagIds, onToggleTag, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${selectedTagIds.length > 0 ? 'text-green-700 dark:text-green-300' : 'text-zinc-600 dark:text-zinc-300'}`}
            >
                <FunnelIcon className="h-4 w-4" />
                <span className="font-semibold whitespace-nowrap">Filter by Tag</span>
                {selectedTagIds.length > 0 && (
                    <span className="bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {selectedTagIds.length}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 p-4 animate-fadeInDown">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Filter Tags</h4>
                        <button onClick={onClear} className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline">Clear</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                        <div>
                            <h5 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">School Tags</h5>
                            <div className="flex flex-wrap gap-2">
                                {schoolTags.map(tag => (
                                    <label key={tag.id} className="cursor-pointer group">
                                        <input type="checkbox" className="sr-only" checked={selectedTagIds.includes(tag.id)} onChange={() => onToggleTag(tag.id)} />
                                        <div className={`transition-all transform group-hover:scale-105 ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-zinc-800 rounded-full' : ''}`}>
                                            <TagComponent name={tag.name} color={tag.color} />
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h5 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Essay Tags</h5>
                             <div className="flex flex-wrap gap-2">
                                {essayTags.map(tag => (
                                    <label key={tag.id} className="cursor-pointer group">
                                        <input type="checkbox" className="sr-only" checked={selectedTagIds.includes(tag.id)} onChange={() => onToggleTag(tag.id)} />
                                        <div className={`transition-all transform group-hover:scale-105 ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-zinc-800 rounded-full' : ''}`}>
                                            <TagComponent name={tag.name} color={tag.color} />
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const Controls: React.FC<ControlsProps> = (props) => {
  const { currentView, onSetView, sortBy, onSortByChange, essaySortBy, onEssaySortByChange, onRefreshSort, searchQuery, onSearchQueryChange, essayTags, schoolTags, filterTagIds, onFilterTagIdsChange, onExpandAll, onCollapseAll, onExportToDocx, resultsCount } = props;
  
  const handleToggleTag = (tagId: string) => {
    onFilterTagIdsChange(
        filterTagIds.includes(tagId)
            ? filterTagIds.filter(id => id !== tagId)
            : [...filterTagIds, tagId]
    );
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-md flex flex-col gap-4">
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
            className="w-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg pl-10 pr-32 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            aria-label="Search applications"
          />
           {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {resultsCount}{' '}
                {currentView === 'essays'
                  ? resultsCount === 1 ? 'essay' : 'essays'
                  : resultsCount === 1 ? 'application' : 'applications'}
              </span>
            </div>
          )}
        </div>
      </div>
       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <TagFilter 
            schoolTags={schoolTags}
            essayTags={essayTags}
            selectedTagIds={filterTagIds}
            onToggleTag={handleToggleTag}
            onClear={() => onFilterTagIdsChange([])}
          />
          {(currentView === 'list' || currentView === 'essays') && (
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="sort" className="font-semibold text-zinc-600 dark:text-zinc-300">Sort by:</label>
                {currentView === 'list' && (
                    <select id="sort" value={sortBy} onChange={(e) => onSortByChange(e.target.value as SortByType)}
                        className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                        <option value="deadline-asc">Deadline (Soonest)</option>
                        <option value="schoolName-asc">School Name (A-Z)</option>
                        <option value="schoolName-desc">School Name (Z-A)</option>
                        <option value="doneness-asc">Doneness (Least to Most)</option>
                        <option value="doneness-desc">Doneness (Most to Least)</option>
                    </select>
                )}
                 {currentView === 'essays' && (
                    <select id="sort" value={essaySortBy} onChange={(e) => onEssaySortByChange(e.target.value as EssaySortByType)}
                        className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                        <option value="deadline-asc">Deadline (Soonest)</option>
                        <option value="schoolName-asc">School Name (A-Z)</option>
                        <option value="wordCount-asc">Word Count (Low-High)</option>
                        <option value="wordCount-desc">Word Count (High-Low)</option>
                    </select>
                )}
                 <button onClick={onRefreshSort}
                    className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all duration-150 active:scale-95 hover:rotate-12"
                    title="Refresh sort order">
                    <ArrowPathIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {currentView === 'list' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={onExpandAll} className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150">
                        Expand All
                    </button>
                    <button onClick={onCollapseAll} className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150">
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