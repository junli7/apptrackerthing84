import React from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isCollapsed, onToggle }) => {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={!isCollapsed}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-')}`}
        className="w-full flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
      >
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
        <ChevronDownIcon className={`h-5 w-5 text-zinc-500 transition-transform transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-')}`}
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;