
import React from 'react';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  onAddSchool: () => void;
  onOpenManageTags: () => void;
  onImportData: () => void;
  onExportData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddSchool, onOpenManageTags, onImportData, onExportData, isDarkMode, onToggleDarkMode }) => {
  return (
    <header className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-lg border-b border-zinc-200/50 dark:border-zinc-700/50 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105">
                <GraduationCapIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-400 dark:hover:to-emerald-400 transition-all duration-500">
              Application Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

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
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-green-500/25 hover:shadow-green-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-200"
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