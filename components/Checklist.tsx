
import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import CheckIcon from './icons/CheckIcon';

interface ChecklistProps {
  items: ChecklistItem[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onRequestDeleteTask: (taskId: string, taskText: string) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onAddTask, onToggleTask, onRequestDeleteTask }) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Checklist</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <button
              onClick={() => onToggleTask(item.id)}
              aria-pressed={item.completed}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                ${item.completed 
                  ? 'bg-green-600 border-green-600' 
                  : 'bg-transparent border-zinc-400 dark:border-zinc-500 hover:border-green-500'}`}
            >
              {item.completed && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            <span className={`flex-grow ${item.completed ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onRequestDeleteTask(item.id, item.text)}
              aria-label={`Delete task: ${item.text}`}
              className="p-1 text-zinc-400 hover:text-red-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add new task..."
          className="flex-grow px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="p-2 bg-green-700 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all duration-150 active:scale-95 hover:-translate-y-0.5"
          aria-label="Add new task"
        >
          <PlusIcon className="h-5 w-5"/>
        </button>
      </form>
    </div>
  );
};

export default Checklist;