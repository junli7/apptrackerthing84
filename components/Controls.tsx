

import React from 'react';
import { Tag } from '../types';
import PencilIcon from './icons/PencilIcon';
import SearchIcon from './icons/SearchIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface ControlsProps {
  sortBy: 'deadline' | 'schoolName';
  onSortByChange: (value: 'deadline' | 'schoolName') => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  essayTags: Tag[];
  filterTagId: string | null;
  onFilterTagIdChange: (tagId: string | null) => void;
  onOpenManageTags: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExportToDocx: () => void;
}

const Controls: React.FC<ControlsProps> = ({ sortBy, onSortByChange, searchQuery, onSearchQueryChange, essayTags, filterTagId, onFilterTagIdChange, onOpenManageTags, onExpandAll, onCollapseAll, onExportToDocx }) => {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between flex-wrap">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center flex-grow w-full md:w-auto">
        <div className="relative w-full sm:flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search schools, tags, essays..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Search applications"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="filterTag" className="font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">Filter Essays:</label>
          <select
            id="filterTag"
            value={filterTagId || ''}
            onChange={(e) => onFilterTagIdChange(e.target.value || null)}
            className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            <option value="">All Tags</option>
            {essayTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="sort" className="font-semibold text-zinc-600 dark:text-zinc-300">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'deadline' | 'schoolName')}
            className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            <option value="deadline">Deadline</option>
            <option value="schoolName">School Name (A-Z)</option>
          </select>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <button
            onClick={onExpandAll}
            className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={onCollapseAll}
            className="w-full sm:w-auto text-sm bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-200 font-medium px-3 py-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
          >
            Collapse All
          </button>
        </div>
        <button
          onClick={onOpenManageTags}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          Manage Tags
        </button>
        <button
          onClick={onExportToDocx}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
        >
          <DocumentTextIcon className="h-4 w-4" />
          Export DOCX
        </button>
      </div>
    </div>
  );
};

export default Controls;
