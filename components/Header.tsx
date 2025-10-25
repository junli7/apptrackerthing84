import React from 'react';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';

interface HeaderProps {
  onAddSchool: () => void;
  onOpenManageTags: () => void;
  onImportData: () => void;
  onExportData: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddSchool, onOpenManageTags, onImportData, onExportData }) => {
  return (
    <header className="bg-white dark:bg-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <span role="img" aria-label="Skull emoji" className="text-3xl">💀</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              le tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onImportData}
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150"
              title="Import Data"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Import Data</span>
            </button>

            <button
              onClick={onExportData}
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-3 py-2 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150"
              title="Export Data"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Export Data</span>
            </button>
            
            <button
              onClick={onAddSchool}
              className="flex items-center gap-2 bg-green-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150"
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