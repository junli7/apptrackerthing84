
import React from 'react';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';

interface HeaderProps {
  onAddSchool: () => void;
  onOpenManageTags: () => void;
  onImportData: () => void;
  onExportData: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddSchool, onOpenManageTags, onImportData, onExportData }) => {
  return (
    <header className="bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <GraduationCapIcon className="h-8 w-8 text-zinc-700 dark:text-zinc-300" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300">
              Application Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onImportData}
              className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md duration-200"
              title="Import Data"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Import</span>
            </button>

            <button
              onClick={onExportData}
              className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md duration-200"
              title="Export Data"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
             <button
              onClick={onOpenManageTags}
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md duration-200"
              title="Manage Tags"
            >
              <PencilIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Manage Tags</span>
            </button>
            
            <button
              onClick={onAddSchool}
              className="flex items-center gap-2 bg-green-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Add School</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;