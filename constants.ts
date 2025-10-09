// Fix: Added TagColor to the import list from the now-correct types.ts.
import { Application, Essay, Tag, Outcome, ChecklistItem, TagColor } from './types';

export const OUTCOME_OPTIONS: Outcome[] = [
  Outcome.IN_PROGRESS,
  Outcome.SUBMITTED,
  Outcome.ACCEPTED,
  Outcome.REJECTED,
  Outcome.WAITLISTED,
  Outcome.DEFERRED,
  Outcome.WITHDRAWN,
];

export const OUTCOME_COLORS: { [key in Outcome]: string } = {
  [Outcome.IN_PROGRESS]: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
  [Outcome.SUBMITTED]: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  [Outcome.ACCEPTED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [Outcome.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [Outcome.WAITLISTED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [Outcome.DEFERRED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [Outcome.WITHDRAWN]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

// Fix: Removed TAG_COLORS constant and TagColor type as they have been moved to types.ts to prevent circular dependencies.

export const TAG_COLOR_CLASSES: Record<TagColor | 'zinc', string> = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    zinc: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
};

export const TAG_BG_CLASSES: Record<TagColor, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-400',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    sky: 'bg-sky-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    fuchsia: 'bg-fuchsia-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
};


export const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: 'Why Us?', color: 'blue', type: 'essay' },
  { id: 't2', name: 'Extracurricular', color: 'green', type: 'essay' },
  { id: 't3', name: 'Personal Statement', color: 'purple', type: 'essay' },
  { id: 't4', name: 'Community', color: 'orange', type: 'essay' },
  { id: 'st1', name: 'Reach', color: 'red', type: 'school' },
  { id: 'st2', name: 'Target', color: 'amber', type: 'school' },
  { id: 'st3', name: 'Safety', color: 'emerald', type: 'school' },
  { id: 'st4', name: 'Public', color: 'sky', type: 'school' },
  { id: 'st5', name: 'Private', color: 'violet', type: 'school' },
];

const createDefaultChecklist = (): ChecklistItem[] => [
    { id: crypto.randomUUID(), text: 'Rec Letters', completed: false },
    { id: crypto.randomUUID(), text: 'Common App', completed: false },
    { id: crypto.randomUUID(), text: 'Their portal', completed: false },
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    schoolName: 'Stanford University',
    deadline: '2025-01-05',
    outcome: Outcome.IN_PROGRESS,
    notes: 'Remember to mention my research with Prof. Smith.',
    checklist: createDefaultChecklist(),
    tagIds: ['st1', 'st5'],
  },
  {
    id: 'a2',
    schoolName: 'Massachusetts Institute of Technology (MIT)',
    deadline: '2025-01-06',
    outcome: Outcome.IN_PROGRESS,
    notes: '',
    checklist: createDefaultChecklist(),
    tagIds: ['st1', 'st5'],
  },
  {
    id: 'a3',
    schoolName: 'University of California, Berkeley',
    deadline: '2024-11-30',
    outcome: Outcome.SUBMITTED,
    notes: 'Submitted on Nov 28th. Included the optional arts supplement.',
    checklist: createDefaultChecklist(),
    tagIds: ['st2', 'st4'],
  },
];

export const INITIAL_ESSAYS: Essay[] = [
  {
    id: 'e1',
    applicationId: 'a1',
    prompt: 'The Stanford community is deeply curious and driven to learn in and out of the classroom. Reflect on an idea or experience that makes you genuinely excited about learning.',
    text: '',
    tagIds: ['t3'],
    order: 0,
    history: [],
    completed: false,
  },
  {
    id: 'e2',
    applicationId: 'a1',
    prompt: 'Briefly elaborate on one of your extracurricular activities or work experiences.',
    text: '',
    tagIds: ['t2'],
    order: 1,
    history: [],
    completed: false,
  },
   {
    id: 'e3',
    applicationId: 'a2',
    prompt: 'Describe the world you come from; for example, your family, clubs, school, community, city, or town. How has that world shaped your dreams and aspirations?',
    text: 'Growing up in a small town...',
    tagIds: ['t4'],
    order: 0,
    history: [],
    completed: false,
  },
];