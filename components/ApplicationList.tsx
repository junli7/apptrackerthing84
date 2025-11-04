import React from 'react';
import { Application, Essay, Tag, Outcome, EssayVersion } from '../types';
import ApplicationCard from './ApplicationCard';

interface ApplicationListProps {
  applications: Application[];
  essaysByApplicationId: Record<string, Essay[]>;
  tagsById: Record<string, Tag>;
  schoolTags: Tag[];
  essayTags: Tag[];
  expandedAppIds: Set<string>;
  filterTagIds: string[];
  onToggleExpand: (appId: string) => void;
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
  sortAndFilterKey: string;
  scrollToAppId: string | null;
  onClearScrollToApp: () => void;
}

const ApplicationList: React.FC<ApplicationListProps> = (props) => {
  React.useEffect(() => {
    if (props.scrollToAppId) {
        const element = document.getElementById(`application-card-${props.scrollToAppId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-scroll');
            setTimeout(() => {
                element.classList.remove('highlight-scroll');
            }, 2000);
        }
        props.onClearScrollToApp();
    }
  }, [props.scrollToAppId, props.sortAndFilterKey, props.onClearScrollToApp]);

  if (props.applications.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">No applications match your search or filter.</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Try a different term or clear the filter.</p>
      </div>
    );
  }

  return (
    <div key={props.sortAndFilterKey} className="space-y-6">
      {props.applications.map((app, index) => {
        const isScrolledTo = props.scrollToAppId === app.id;
        return (
          <ApplicationCard
            key={app.id}
            application={app}
            animationDelay={index * 50}
            isExpanded={props.expandedAppIds.has(app.id)}
            onToggleExpand={() => props.onToggleExpand(app.id)}
            essays={props.essaysByApplicationId[app.id] || []}
            tagsById={props.tagsById}
            schoolTags={props.schoolTags}
            essayTags={props.essayTags}
            filterTagIds={props.filterTagIds}
            onUpdateApplication={props.onUpdateApplication}
            onRequestDeleteApplication={props.onRequestDeleteApplication}
            onAddEssay={props.onAddEssay}
            onUpdateEssay={props.onUpdateEssay}
            onToggleEssayComplete={props.onToggleEssayComplete}
            onCommitEssayHistory={props.onCommitEssayHistory}
            onRequestDeleteEssay={props.onRequestDeleteEssay}
            onReorderEssays={props.onReorderEssays}
            onAddTask={props.onAddTask}
            onToggleTask={props.onToggleTask}
            onRequestDeleteTask={props.onRequestDeleteTask}
            onAddTag={props.onAddTag}
            expandedEssayIds={props.expandedEssayIds}
            onToggleEssayExpand={props.onToggleEssayExpand}
            expandedSectionKeys={props.expandedSectionKeys}
            onToggleSectionExpand={props.onToggleSectionExpand}
            onExpandAppContent={props.onExpandAppContent}
            onCollapseAppContent={props.onCollapseAppContent}
            onOpenHistoryViewer={props.onOpenHistoryViewer}
            isScrolledTo={isScrolledTo}
          />
        );
      })}
    </div>
  );
};

export default ApplicationList;