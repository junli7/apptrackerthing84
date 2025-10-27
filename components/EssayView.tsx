import React, { useMemo } from 'react';
import { Essay, Application, Tag, EssayVersion } from '../types';
import EssayItem from './EssayItem';

interface EssayViewProps {
  essays: Essay[];
  applications: Application[];
  tagsById: Record<string, Tag>;
  essayTags: Tag[];
  onUpdateEssay: (essay: Essay) => void;
  onToggleEssayComplete: (essayId: string) => void;
  onCommitEssayHistory: (essayId: string, currentText: string) => void;
  onRequestDeleteEssay: (essayId: string, essayPrompt: string) => void;
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
  expandedEssayIds: Set<string>;
  onToggleEssayExpand: (essayId: string) => void;
  onOpenHistoryViewer: (version: EssayVersion) => void;
}

const EssayView: React.FC<EssayViewProps> = (props) => {
    const { essays, applications, tagsById, essayTags, onUpdateEssay, onToggleEssayComplete, onCommitEssayHistory, onRequestDeleteEssay, onAddTag, expandedEssayIds, onToggleEssayExpand, onOpenHistoryViewer } = props;

    const appsById = useMemo(() => {
        return new Map(applications.map(app => [app.id, app]));
    }, [applications]);

    if (essays.length === 0) {
        return (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">No essays to display.</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Add an application and an essay, or try a different search term.</p>
          </div>
        );
    }
      
    return (
        <div className="space-y-4">
            {essays.map((essay, index) => {
                const app = appsById.get(essay.applicationId);
                return (
                    <EssayItem
                        key={essay.id}
                        essay={essay}
                        tags={essay.tagIds.map(id => tagsById[id]).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name))}
                        essayTags={essayTags}
                        onUpdateEssay={onUpdateEssay}
                        onToggleEssayComplete={onToggleEssayComplete}
                        onCommitEssayHistory={onCommitEssayHistory}
                        onRequestDeleteEssay={onRequestDeleteEssay}
                        onAddTag={onAddTag}
                        isExpanded={expandedEssayIds.has(essay.id)}
                        onToggleExpand={() => onToggleEssayExpand(essay.id)}
                        onOpenHistoryViewer={onOpenHistoryViewer}
                        schoolName={app?.schoolName}
                        applicationDeadline={app?.deadline}
                        animationDelay={index * 50}
                    />
                );
            })}
        </div>
    );
};

export default EssayView;