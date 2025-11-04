
import React, { useState, useEffect, useRef } from 'react';
import { Essay, Tag, TAG_COLORS, TagColor, EssayVersion } from '../types';
import TagComponent from './Tag';
import TrashIcon from './icons/TrashIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';
import XMarkIcon from './icons/XMarkIcon';
import Bars2Icon from './icons/Bars2Icon';
import ColorPicker from './ColorPicker';
import PlusIcon from './icons/PlusIcon';
import ClockIcon from './icons/ClockIcon';
import BookmarkSquareIcon from './icons/BookmarkSquareIcon';


interface EssayItemProps {
  essay: Essay;
  tags: Tag[];
  essayTags: Tag[];
  onUpdateEssay: (essay: Essay) => void;
  onToggleEssayComplete: (essayId: string) => void;
  onCommitEssayHistory: (essayId: string, currentText: string) => void;
  onRequestDeleteEssay: (essayId: string, essayPrompt: string) => void;
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDraggable?: boolean;
  isBeingDragged?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onOpenHistoryViewer: (version: EssayVersion) => void;
  schoolName?: string;
  applicationDeadline?: string;
  animationDelay?: number;
}

const countWords = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const EssayItem: React.FC<EssayItemProps> = ({ 
    essay, 
    tags,
    essayTags,
    onUpdateEssay, 
    onToggleEssayComplete,
    onCommitEssayHistory,
    onRequestDeleteEssay, 
    onAddTag,
    isExpanded, 
    onToggleExpand,
    isDraggable,
    isBeingDragged,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onOpenHistoryViewer,
    schoolName,
    applicationDeadline,
    animationDelay,
}) => {
  const [text, setText] = useState(essay.text);
  const [wordCount, setWordCount] = useState(countWords(essay.text));
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(essay.prompt);
  const [editedTagIds, setEditedTagIds] = useState(essay.tagIds);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>(TAG_COLORS[0]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(essay.text);
    setWordCount(countWords(essay.text));
  }, [essay.text]);

  useEffect(() => {
    setEditedPrompt(essay.prompt);
    setEditedTagIds(essay.tagIds);
  }, [essay.prompt, essay.tagIds]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text, isExpanded]);

  useEffect(() => {
    const handler = setTimeout(() => {
        if (text !== essay.text) {
             onUpdateEssay({ ...essay, text: text });
        }
    }, 500); // Debounce updates

    return () => {
      clearTimeout(handler);
    };
  }, [text, essay, onUpdateEssay]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setWordCount(countWords(newText));
  };
  
  const handleSaveEdit = () => {
    if (editedPrompt.trim()) {
        onUpdateEssay({ ...essay, prompt: editedPrompt.trim(), tagIds: editedTagIds });
        setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPrompt(essay.prompt);
    setEditedTagIds(essay.tagIds);
  };

  const handleTagToggle = (tagId: string) => {
    setEditedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };
  
  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const newTag = onAddTag(newTagName.trim(), newTagColor, 'essay');
      setEditedTagIds(prev => [...prev, newTag.id]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
    }
  };
  
  const handleWrapperClick = () => {
    if (!isEditing) {
      onToggleExpand();
    }
  }

  const handleRestoreVersion = (versionText: string) => {
    onUpdateEssay({ ...essay, text: versionText });
    setHistoryVisible(false); // Optionally close history after restoring
  };

  const formattedDeadline = applicationDeadline ? new Date(applicationDeadline + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'long', day: 'numeric'
  }) : '';
  
  const animationStyle = animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : {};
  const animationClass = animationDelay !== undefined ? 'animate-fadeInUp' : '';

  const containerClass = schoolName 
    ? 'bg-white dark:bg-zinc-800 rounded-lg shadow-sm'
    : `bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${isBeingDragged ? 'opacity-50' : 'opacity-100'}`;
  
  return (
    <div 
        style={animationStyle}
        className={`${containerClass} ${animationClass}`}
        draggable={isDraggable && !isEditing}
        onDragStart={isDraggable ? onDragStart : undefined}
        onDragOver={isDraggable ? onDragOver : undefined}
        onDrop={isDraggable ? onDrop : undefined}
        onDragEnd={isDraggable ? onDragEnd : undefined}
    >
      <div
        className={`flex items-start p-4 rounded-t-lg transition-colors ${!isEditing ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
        onClick={handleWrapperClick}
      >
        {isDraggable && (
             <div className="flex-shrink-0 cursor-move text-zinc-400 dark:text-zinc-500 mr-3 mt-1" onMouseDown={(e) => e.stopPropagation()}>
                <Bars2Icon className="h-5 w-5" />
            </div>
        )}
        <div className="flex-grow pr-4">
          {schoolName && (
            <div className="mb-2">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{schoolName}</p>
              {applicationDeadline && <p className="text-xs text-zinc-500 dark:text-zinc-400">Deadline: {formattedDeadline}</p>}
            </div>
          )}
          {isEditing ? (
              <div onClick={(e) => e.stopPropagation()}>
                <textarea 
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                  rows={3}
                />
                 <div className="mt-3">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Essay Tags</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-md border border-zinc-200 dark:border-zinc-600">
                    {essayTags.map(tag => (
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
                  <div className="mt-3 p-3 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="flex gap-2 items-center">
                         <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                          placeholder="Create new tag..."
                          className="flex-grow px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewTag}
                          className="p-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800"
                          aria-label="Add new tag"
                        >
                          <PlusIcon className="h-5 w-5"/>
                        </button>
                      </div>
                      <div className="mt-3">
                          <ColorPicker selectedColor={newTagColor} onSelectColor={setNewTagColor} />
                      </div>
                  </div>
                </div>
              </div>
          ) : (
            <p className="font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              {essay.completed && <CheckIcon className="h-5 w-5 text-green-600 shrink-0" />}
              <span>{essay.prompt}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => <TagComponent key={tag.id} name={tag.name} color={tag.color} />)}
          </div>
        </div>
        <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
           {isEditing ? (
            <>
                 <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><CheckIcon className="h-5 w-5"/></button>
                 <button onClick={handleCancelEdit} className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"><XMarkIcon className="h-5 w-5"/></button>
            </>
           ) : (
            <>
              {essay.history && essay.history.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHistoryVisible(!isHistoryVisible);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-green-500 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                  aria-label="View essay history"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-green-500 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                aria-label="Edit essay prompt"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDeleteEssay(essay.id, essay.prompt);
                }}
                className="p-1.5 text-zinc-400 hover:text-red-500 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                aria-label="Delete essay"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <ChevronDownIcon className={`h-5 w-5 text-zinc-500 transition-transform transform duration-200 ${!isExpanded ? '' : 'rotate-180'} ml-2`} />
            </>
           )}
        </div>
      </div>
      
      {isHistoryVisible && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700" onClick={e => e.stopPropagation()}>
           <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 pt-3 mb-2">Version History</h4>
           <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {essay.history.map((version, index) => (
                <div key={index} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md flex justify-between items-center transition-all duration-150 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:shadow-md">
                   <button 
                    onClick={() => onOpenHistoryViewer(version)} 
                    className="text-left flex-grow hover:underline focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 rounded-md p-1 -m-1"
                  >
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {new Date(version.timestamp).toLocaleString()}
                    </p>
                  </button>
                   <button 
                    onClick={() => handleRestoreVersion(version.text)}
                    className="ml-4 text-xs bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 font-semibold px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors flex-shrink-0"
                  >
                    Restore
                  </button>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-100/50 dark:bg-black/20">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onClick={(e) => e.stopPropagation()}
              placeholder="Start writing your essay here..."
              className="w-full p-2 mt-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-hidden"
            />
            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCommitEssayHistory(essay.id, text)}
                  className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 font-semibold px-3 py-1 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Commit to history"
                >
                  <BookmarkSquareIcon className="h-4 w-4" />
                  Commit to History
                </button>
                <button
                  onClick={() => onToggleEssayComplete(essay.id)}
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${essay.completed 
                      ? 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50'}`}
                >
                  <CheckIcon className="h-4 w-4" />
                  {essay.completed ? 'Mark as In-Progress' : 'Mark as Complete'}
                </button>
              </div>
              <p className="text-right text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayItem;