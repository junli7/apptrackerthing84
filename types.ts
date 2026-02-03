// Fix: Moved TAG_COLORS constant here from constants.ts to break a circular dependency.
export const TAG_COLORS = [
  'rose', 'pink', 'fuchsia', 'purple', 'violet', 'indigo', 'blue', 'sky', 'cyan', 'teal', 'emerald', 'green', 'lime', 'yellow', 'amber', 'orange', 'red'
] as const;

// Fix: Defined TagColor type here.
export type TagColor = typeof TAG_COLORS[number];

// Fix: Defined and exported the Outcome enum.
export enum Outcome {
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  WAITLISTED = 'Waitlisted',
  DEFERRED = 'Deferred',
  WITHDRAWN = 'Withdrawn',
}

// Fix: Defined and exported the ChecklistItem interface.
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Location interface for map view
export interface SchoolLocation {
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

// Fix: Defined and exported the Application interface.
export interface Application {
  id: string;
  schoolName: string;
  deadline: string; // YYYY-MM-DD
  outcome: Outcome;
  notes: string;
  checklist: ChecklistItem[];
  tagIds: string[];
  decisionDate?: string; // YYYY-MM-DD - when the decision was received
  financialAid?: number; // Annual financial aid amount offered in dollars
  tuitionCost?: number; // Annual cost of attendance in dollars
  responseDeadline?: string; // YYYY-MM-DD - deadline to respond/commit
  pros?: string[]; // List of pros for this school
  cons?: string[]; // List of cons for this school
  location?: SchoolLocation; // School location for map view
}

export interface EssayVersion {
  text: string;
  timestamp: string;
}

// Fix: Defined and exported the Essay interface.
export interface Essay {
  id: string;
  applicationId: string;
  prompt: string;
  text: string;
  tagIds: string[];
  order: number;
  history: EssayVersion[];
  completed: boolean;
}

// Fix: Defined and exported the Tag interface.
export interface Tag {
  id: string;
  name: string;
  color: string;
  type: 'school' | 'essay';
}