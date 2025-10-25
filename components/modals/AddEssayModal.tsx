import React, { useState } from 'react';
import { Essay, Tag, TAG_COLORS, TagColor } from '../../types';
import TagComponent from '../Tag';
import PlusIcon from '../icons/PlusIcon';
import ColorPicker from '../ColorPicker';
import ModalWrapper from './ModalWrapper';

interface AddEssayModalProps {
  applicationId: string;
  essayTags: Tag[];
  onClose: () => void;
  onAddEssay: (essay: Omit<Essay, 'id' | 'order' | 'history' | 'completed'>) => void;
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
}

const AddEssayModal: React.FC<AddEssayModalProps> = ({ applicationId, essayTags, onClose, onAddEssay, onAddTag }) => {
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>(TAG_COLORS[0]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };
  
  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const newTag = onAddTag(newTagName.trim(), newTagColor, 'essay');
      setSelectedTagIds(prev => [...prev, newTag.id]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt) {
      onAddEssay({
        applicationId,
        prompt,
        text,
        tagIds: selectedTagIds
      });
      onClose();
    }
  };

  return (
    <ModalWrapper onClose={onClose} widthClass="max-w-lg">
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Add New Essay</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Essay Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Essay Tags</label>
              <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-md border border-zinc-200 dark:border-zinc-600">
                {essayTags.map(tag => (
                   <button
                    type="button"
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`rounded-full transition-transform transform hover:scale-105 focus:outline-none ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-green-600 dark:ring-green-500 ring-offset-2 dark:ring-offset-zinc-800' : 'ring-0'}`}
                  >
                    <TagComponent name={tag.name} color={tag.color} />
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 border border-zinc-200 dark:border-zinc-600 rounded-lg">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Create New Essay Tag</label>
                  <div className="flex gap-2 items-center">
                     <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                      placeholder="New tag name..."
                      className="flex-grow px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700/50 px-6 py-3 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-green-700 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Add Essay
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddEssayModal;