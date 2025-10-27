import React, { useMemo, useState } from 'react';
import { Application, Tag, Outcome } from '../types';
import { OUTCOME_OPTIONS, OUTCOME_COLORS } from '../constants';
import TagComponent from './Tag';

interface BoardCardProps {
    application: Application;
    tags: Tag[];
    animationDelay: number;
}

const BoardCard: React.FC<BoardCardProps> = ({ application, tags, animationDelay }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('applicationId', application.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const formattedDeadline = new Date(application.deadline + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'long', day: 'numeric'
    });

    return (
        <div 
            style={{ animationDelay: `${animationDelay}ms` }}
            draggable 
            onDragStart={handleDragStart}
            className="bg-white dark:bg-zinc-700 p-3 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-600 cursor-grab active:cursor-grabbing animate-fadeInUp"
        >
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">{application.schoolName}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Deadline: <span className="font-medium">{formattedDeadline}</span>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => <TagComponent key={tag.id} name={tag.name} color={tag.color} />)}
            </div>
        </div>
    );
};


interface BoardColumnProps {
    outcome: Outcome;
    applications: Application[];
    tagsById: Record<string, Tag>;
    onUpdateApplicationOutcome: (appId: string, newOutcome: Outcome) => void;
    animationDelay: number;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ outcome, applications, tagsById, onUpdateApplicationOutcome, animationDelay }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const applicationId = e.dataTransfer.getData('applicationId');
        if (applicationId) {
            onUpdateApplicationOutcome(applicationId, outcome);
        }
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    
    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <div 
            style={{ animationDelay: `${animationDelay}ms` }}
            className={`w-72 md:w-80 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg h-full transition-colors animate-fadeInUp ${isDragOver ? 'bg-green-100 dark:bg-green-900/50' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="p-3 sticky top-0 bg-zinc-100 dark:bg-zinc-800 rounded-t-lg z-10">
                <h3 className={`text-sm font-bold flex items-center gap-2 px-2`}>
                    <span className={`${OUTCOME_COLORS[outcome]} px-2 py-0.5 rounded-md`}>{outcome}</span>
                    <span className="text-zinc-400 dark:text-zinc-500">{applications.length}</span>
                </h3>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto h-[calc(100%-4rem)]">
                {applications.length > 0 ? (
                     applications.map((app, index) => (
                        <BoardCard 
                            key={app.id} 
                            application={app} 
                            tags={(app.tagIds || []).map(id => tagsById[id]).filter(Boolean)} 
                            animationDelay={index * 50}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        No applications here.
                    </div>
                )}
            </div>
        </div>
    );
};


interface BoardViewProps {
    applications: Application[];
    tagsById: Record<string, Tag>;
    onUpdateApplicationOutcome: (appId: string, newOutcome: Outcome) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ applications, tagsById, onUpdateApplicationOutcome }) => {
    const applicationsByOutcome = useMemo(() => {
        const grouped: Record<string, Application[]> = {};
        for (const outcome of OUTCOME_OPTIONS) {
            grouped[outcome] = [];
        }
        applications.forEach(app => {
            if (grouped[app.outcome]) {
                grouped[app.outcome].push(app);
            }
        });
        return grouped;
    }, [applications]);

    return (
        <div className="flex gap-4 overflow-x-auto p-2 -mx-2 h-[calc(100vh-20rem)] min-h-[400px]">
            {OUTCOME_OPTIONS.map((outcome, index) => (
                <BoardColumn 
                    key={outcome}
                    outcome={outcome}
                    applications={applicationsByOutcome[outcome]}
                    tagsById={tagsById}
                    onUpdateApplicationOutcome={onUpdateApplicationOutcome}
                    animationDelay={index * 100}
                />
            ))}
        </div>
    );
};

export default BoardView;