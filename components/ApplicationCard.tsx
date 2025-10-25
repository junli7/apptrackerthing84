
import React, { useState, useEffect, useMemo } from 'react';
import { Application, Essay, Tag, Outcome, TAG_COLORS, TagColor, EssayVersion } from '../types';
import { OUTCOME_OPTIONS, OUTCOME_COLORS } from '../constants';
import EssayItem from './EssayItem';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Checklist from './Checklist';
import CollapsibleSection from './CollapsibleSection';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';
import XMarkIcon from './icons/XMarkIcon';
import TagComponent from './Tag';

interface ApplicationCardProps {
  application: Application;
  essays: Essay[];
  tagsById: Record<string, Tag>;
  schoolTags: Tag[];
  essayTags: Tag[];
  isExpanded: boolean;
  filterTagId: string | null;
  onToggleExpand: () => void;
  onUpdateApplication: (app: Application) => void;
  onRequestDeleteApplication: (appId: string, appName: string) => void;
  onAddEssay: (applicationId: string) => void;
  onUpdateEssay: (essay: Essay) => void;
  onToggleEssayComplete: (essayId: string) => void;
  onCommitEssayHistory: (essayId: string, currentText: string) => void;
  onRequestDeleteEssay: (essayId: string, essayPrompt: string) => void;
  onReorderEssays: (applicationId: string, draggedEssayId: string, targetEssayId: string) => void;
  onAddTask: (applicationId: string, text: string) => void;
  onToggleTask: (applicationId: string, taskId: string) => void;
  onRequestDeleteTask: (applicationId: string, taskId: string, taskText: string) => void;
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
  expandedEssayIds: Set<string>;
  onToggleEssayExpand: (essayId: string) => void;
  expandedSectionKeys: Record<string, Set<'checklist' | 'notes'>>;
  onToggleSectionExpand: (appId: string, sectionKey: 'checklist' | 'notes') => void;
  onExpandAppContent: (appId: string) => void;
  onCollapseAppContent: (appId: string) => void;
  onOpenHistoryViewer: (version: EssayVersion) => void;
  animationDelay: number;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  essays,
  tagsById,
  schoolTags,
  essayTags,
  onUpdateApplication,
  onRequestDeleteApplication,
  onAddEssay,
  onUpdateEssay,
  onToggleEssayComplete,
  onCommitEssayHistory,
  onRequestDeleteEssay,
  onReorderEssays,
  onAddTask,
  onToggleTask,
  onRequestDeleteTask,
  isExpanded,
  onToggleExpand,
  onAddTag,
  filterTagId,
  expandedEssayIds,
  onToggleEssayExpand,
  expandedSectionKeys,
  onToggleSectionExpand,
  onExpandAppContent,
  onCollapseAppContent,
  onOpenHistoryViewer,
  animationDelay,
}) => {
  const [notes, setNotes] = useState(application.notes);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchoolName, setEditedSchoolName] = useState(application.schoolName);
  const [editedDeadline, setEditedDeadline] = useState(application.deadline);
  const [editedTagIds, setEditedTagIds] = useState(application.tagIds || []);
  const [draggedEssayId, setDraggedEssayId] = useState<string | null>(null);

  const { completedTasks, totalTasks, progressPercentage, completedEssaysCount, totalEssaysCount } = useMemo(() => {
    const completedChecklistItems = application.checklist.filter(item => item.completed).length;
    const totalChecklistItems = application.checklist.length;
    const completedEssays = essays.filter(e => e.completed).length;
    const totalEssays = essays.length;

    const total = totalChecklistItems + totalEssays;
    const completed = completedChecklistItems + completedEssays;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
        completedTasks: completed,
        totalTasks: total,
        progressPercentage: percentage,
        completedEssaysCount: completedEssays,
        totalEssaysCount: totalEssays,
    };
  }, [application.checklist, essays]);


  const { cardBgClass, cardBgStyle } = useMemo(() => {
    // Hue progresses from red (0) -> yellow (60) -> green (120)
    let hue;
    if (progressPercentage <= 50) {
      // Interpolate from red (0) to yellow (60)
      hue = (progressPercentage / 50) * 60;
    } else {
      // Interpolate from yellow (60) to green (120)
      hue = 60 + ((progressPercentage - 50) / 50) * 60;
    }
    
    // For light mode: a more vibrant, saturated tint
    const lightColor = `hsl(${hue} 100% 92%)`;

    // For dark mode: a more vibrant, dark tint
    const darkColor = `hsl(${hue} 45% 20%)`;

    return {
      cardBgClass: 'bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)]',
      cardBgStyle: {
        '--card-bg-light': lightColor,
        '--card-bg-dark': darkColor,
      } as React.CSSProperties,
    };
  }, [progressPercentage]);
  
  const isEssayFilterActive = !!filterTagId;

  const animationStyle = { animationDelay: `${animationDelay}ms` };

  const handleOutcomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateApplication({ ...application, outcome: e.target.value as Outcome });
  };
  
  useEffect(() => {
    setNotes(application.notes);
  }, [application.notes]);
  
  useEffect(() => {
    setEditedSchoolName(application.schoolName);
    setEditedDeadline(application.deadline);
    setEditedTagIds(application.tagIds || []);
  }, [application]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (notes !== application.notes) {
        onUpdateApplication({ ...application, notes });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [notes, application, onUpdateApplication]);
  
  const handleTagToggle = (tagId: string) => {
    setEditedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = () => {
    if (editedSchoolName.trim()) {
      onUpdateApplication({
        ...application,
        schoolName: editedSchoolName.trim(),
        deadline: editedDeadline,
        tagIds: editedTagIds,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSchoolName(application.schoolName);
    setEditedDeadline(application.deadline);
    setEditedTagIds(application.tagIds || []);
  };

  const formattedDeadline = new Date(application.deadline + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });

  const displayedEssays = useMemo(() => {
    if (!filterTagId) {
      return essays;
    }
    return essays.filter(essay => essay.tagIds.includes(filterTagId));
  }, [essays, filterTagId]);
  
  const isChecklistCollapsed = !expandedSectionKeys[application.id]?.has('checklist');
  const isNotesCollapsed = !expandedSectionKeys[application.id]?.has('notes');
  
  const handleDragStart = (e: React.DragEvent, essayId: string) => {
    setDraggedEssayId(essayId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', essayId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetEssayId: string) => {
    e.preventDefault();
    if (draggedEssayId && draggedEssayId !== targetEssayId) {
      onReorderEssays(application.id, draggedEssayId, targetEssayId);
    }
    setDraggedEssayId(null);
  };

  const handleDragEnd = () => {
    setDraggedEssayId(null);
  };

  return (
    <div style={{ ...cardBgStyle, ...animationStyle }} className={`${cardBgClass} rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 animate-fadeInUp`}>
      <div
        role="button"
        tabIndex={isEditing ? -1 : 0}
        aria-expanded={isExpanded}
        aria-controls={`application-details-${application.id}`}
        onClick={isEditing ? undefined : onToggleExpand}
        onKeyDown={isEditing ? undefined : (e) => (e.key === 'Enter' || e.key === ' ') && onToggleExpand()}
        className={`p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${isEditing ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editedSchoolName}
                  onChange={(e) => setEditedSchoolName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xl md:text-2xl font-bold bg-zinc-100 dark:bg-zinc-700 p-1 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="School Name"
                />
                <input
                  type="date"
                  value={editedDeadline}
                  onChange={(e) => setEditedDeadline(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-700 p-1 rounded-md w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Deadline"
                />
                <div className="mt-2" onClick={e => e.stopPropagation()}>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">School Tags</label>
                    <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-200 dark:border-zinc-700">
                      {schoolTags.map(tag => (
                         <button
                          type="button"
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.id)}
                          className={`rounded-full transition-transform transform hover:scale-105 focus:outline-none ${editedTagIds.includes(tag.id) ? 'ring-2 ring-green-600 dark:ring-green-500 ring-offset-2 dark:ring-offset-zinc-800' : 'ring-0'}`}
                        >
                          <TagComponent name={tag.name} color={tag.color} />
                        </button>
                      ))}
                    </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white truncate">{application.schoolName}</h2>
                <div className="mt-1">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Deadline: <span className="font-semibold">{formattedDeadline}</span>
                  </p>
                </div>
                 <div className="flex flex-wrap gap-1 mt-2">
                  {(application.tagIds || []).map(id => tagsById[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)).map(tag => (
                    <TagComponent key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
                {(totalEssaysCount > 0 || totalTasks > 0) && (
                  <div className="flex items-end justify-between gap-4 mt-4">
                    {/* Essay Count */}
                    <div className="flex-shrink-0">
                      {totalEssaysCount > 0 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {completedEssaysCount} / {totalEssaysCount} Essays
                        </p>
                      )}
                    </div>
                    {/* Overall Progress Bar */}
                    <div className="flex-grow">
                      {totalTasks > 0 && (
                        <>
                          <div className="flex justify-end items-baseline mb-1">
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{completedTasks} / {totalTasks}</span>
                          </div>
                          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progressPercentage}%` }}
                              role="progressbar"
                              aria-valuenow={completedTasks}
                              aria-valuemin={0}
                              aria-valuemax={totalTasks}
                              aria-label="Overall progress for checklist items and essays"
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            <select
              value={application.outcome}
              onChange={handleOutcomeChange}
              className={`${OUTCOME_COLORS[application.outcome]} font-semibold text-sm px-3 py-2 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800`}
              disabled={isEditing}
            >
              {OUTCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
                  aria-label="Save changes"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-800 transition-colors"
                  aria-label="Cancel edit"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
               <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-zinc-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-colors"
                  aria-label={`Edit ${application.schoolName}`}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => onRequestDeleteApplication(application.id, application.schoolName)}
                  className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-800 transition-colors"
                  aria-label={`Delete ${application.schoolName}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </>
            )}

          </div>
           <ChevronDownIcon className={`h-6 w-6 text-zinc-500 transition-transform transform duration-200 ${isExpanded ? 'rotate-180' : ''} shrink-0`} />
        </div>
      </div>
      
      <div id={`application-details-${application.id}`} className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {!isEssayFilterActive && (
            <div className="p-4 md:px-6 md:py-3 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <h4 className="text-sm font-semibold mr-auto text-zinc-600 dark:text-zinc-400">Sections</h4>
              <button onClick={() => onExpandAppContent(application.id)} className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-150">Expand Content</button>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <button onClick={() => onCollapseAppContent(application.id)} className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-150">Collapse Content</button>
            </div>
          )}
          <div>
            <div className="p-4 md:p-6 space-y-4">
              {!isEssayFilterActive && (
                <>
                  <CollapsibleSection title="Checklist" isCollapsed={isChecklistCollapsed} onToggle={() => onToggleSectionExpand(application.id, 'checklist')}>
                    <Checklist
                      items={application.checklist}
                      onAddTask={(text) => onAddTask(application.id, text)}
                      onToggleTask={(taskId) => onToggleTask(application.id, taskId)}
                      onRequestDeleteTask={(taskId, taskText) => onRequestDeleteTask(application.id, taskId, taskText)}
                    />
                  </CollapsibleSection>

                  <CollapsibleSection title="Notes" isCollapsed={isNotesCollapsed} onToggle={() => onToggleSectionExpand(application.id, 'notes')}>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Add personal notes, thoughts, or to-do items for this application..."
                      className="w-full h-24 p-2 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                      aria-label={`Notes for ${application.schoolName}`}
                    />
                  </CollapsibleSection>
                </>
              )}

              <div>
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Essays</h3>
                {displayedEssays.length > 0 ? (
                  <div className="space-y-4">
                    {displayedEssays.map(essay => (
                      <EssayItem
                        key={essay.id}
                        essay={essay}
                        tags={essay.tagIds.map(id => tagsById[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name))}
                        essayTags={essayTags}
                        onUpdateEssay={onUpdateEssay}
                        onToggleEssayComplete={onToggleEssayComplete}
                        onCommitEssayHistory={onCommitEssayHistory}
                        onRequestDeleteEssay={onRequestDeleteEssay}
                        onAddTag={onAddTag}
                        isExpanded={expandedEssayIds.has(essay.id)}
                        onToggleExpand={() => onToggleEssayExpand(essay.id)}
                        isDraggable={!isEssayFilterActive}
                        isBeingDragged={draggedEssayId === essay.id}
                        onDragStart={(e) => handleDragStart(e, essay.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, essay.id)}
                        onDragEnd={handleDragEnd}
                        onOpenHistoryViewer={onOpenHistoryViewer}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 italic">
                     {filterTagId ? 'No essays match the selected tag.' : 'No essays added yet.'}
                  </p>
                )}
              </div>
            </div>

            {!isEssayFilterActive && (
              <div className="p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => onAddEssay(application.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 transition-all active:scale-95 hover:-translate-y-0.5 duration-150"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Essay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;