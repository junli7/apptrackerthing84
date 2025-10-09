

import React, { useState } from 'react';
import { Application, Outcome, Tag, TAG_COLORS, TagColor } from '../../types';
import TagComponent from '../Tag';
import PlusIcon from '../icons/PlusIcon';
import ColorPicker from '../ColorPicker';

interface AddSchoolModalProps {
  onClose: () => void;
  onAddSchool: (school: Omit<Application, 'id' | 'notes' | 'checklist'>) => void;
  schoolTags: Tag[];
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool, schoolTags, onAddTag }) => {
  const [schoolName, setSchoolName] = useState('');
  const [deadline, setDeadline] = useState('');
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
      const newTag = onAddTag(newTagName.trim(), newTagColor, 'school');
      setSelectedTagIds(prev => [...prev, newTag.id]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolName && deadline) {
      onAddSchool({
        schoolName,
        deadline,
        outcome: Outcome.IN_PROGRESS,
        tagIds: selectedTagIds,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Add New School</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">School Name</label>
                <input
                  type="text"
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Application Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">School Tags (Optional)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-md border border-zinc-200 dark:border-zinc-600">
                  {schoolTags.map(tag => (
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
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Create New School Tag</label>
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add School
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSchoolModal;