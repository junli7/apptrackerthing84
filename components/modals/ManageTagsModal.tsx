import React, { useState } from 'react';
import { Tag, TAG_COLORS, TagColor } from '../../types';
import TagComponent from '../Tag';
import ColorPicker from '../ColorPicker';
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';
import PencilIcon from '../icons/PencilIcon';
import CheckIcon from '../icons/CheckIcon';

interface ManageTagsModalProps {
  tags: Tag[];
  onClose: () => void;
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
  onUpdateTag: (tag: Tag) => void;
  onRequestDeleteTag: (tagId: string, tagName: string) => void;
}

const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ tags, onClose, onAddTag, onUpdateTag, onRequestDeleteTag }) => {
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState<TagColor>(TAG_COLORS[0]);

  const [newSchoolTagName, setNewSchoolTagName] = useState('');
  const [newSchoolTagColor, setNewSchoolTagColor] = useState<TagColor>(TAG_COLORS[0]);
  const [newEssayTagName, setNewEssayTagName] = useState('');
  const [newEssayTagColor, setNewEssayTagColor] = useState<TagColor>(TAG_COLORS[0]);
  
  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setEditingTagColor(tag.color as TagColor);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
  };
  
  const handleSaveEdit = () => {
    const tagToEdit = tags.find(t => t.id === editingTagId);
    if (tagToEdit && editingTagName.trim()) {
      onUpdateTag({ id: editingTagId, name: editingTagName.trim(), color: editingTagColor, type: tagToEdit.type });
      handleCancelEdit();
    }
  };
  
  const handleAddNewTag = (type: 'school' | 'essay') => {
    if (type === 'school' && newSchoolTagName.trim()) {
      onAddTag(newSchoolTagName.trim(), newSchoolTagColor, 'school');
      setNewSchoolTagName('');
      setNewSchoolTagColor(TAG_COLORS[0]);
    } else if (type === 'essay' && newEssayTagName.trim()) {
      onAddTag(newEssayTagName.trim(), newEssayTagColor, 'essay');
      setNewEssayTagName('');
      setNewEssayTagColor(TAG_COLORS[0]);
    }
  };

  const schoolTags = tags.filter(t => t.type === 'school');
  const essayTags = tags.filter(t => t.type === 'essay');
  
  return (
     <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Manage Tags</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* School Tags Section */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">School Tags</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {schoolTags.map(tag => (
                    <div key={tag.id} className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2">
                      {editingTagId === tag.id ? (
                        <>
                          <input 
                            type="text"
                            value={editingTagName}
                            onChange={(e) => setEditingTagName(e.target.value)}
                            className="flex-grow px-2 py-1 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                          />
                          <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><CheckIcon className="h-5 w-5"/></button>
                        </>
                      ) : (
                        <>
                          <div className="flex-grow">
                            <TagComponent name={tag.name} color={tag.color} />
                          </div>
                          <button onClick={() => handleStartEdit(tag)} className="p-1.5 text-zinc-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><PencilIcon className="h-4 w-4"/></button>
                          <button onClick={() => onRequestDeleteTag(tag.id, tag.name)} className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><TrashIcon className="h-4 w-4"/></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {editingTagId && schoolTags.some(t => t.id === editingTagId) && (
                  <div className="p-3 mt-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50">
                    <ColorPicker selectedColor={editingTagColor} onSelectColor={setEditingTagColor} />
                    <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:underline mt-2">Cancel Edit</button>
                  </div>
                )}
                 <div className="mt-4">
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Create New School Tag</h4>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text" value={newSchoolTagName} onChange={(e) => setNewSchoolTagName(e.target.value)}
                      placeholder="e.g. 'Reach', 'Public'"
                      className="flex-grow px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                    />
                    <button type="button" onClick={() => handleAddNewTag('school')}
                      className="p-2 bg-green-700 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800">
                      <PlusIcon className="h-5 w-5"/>
                    </button>
                  </div>
                  <div className="mt-3"><ColorPicker selectedColor={newSchoolTagColor} onSelectColor={setNewSchoolTagColor} /></div>
                </div>
              </div>

              {/* Essay Tags Section */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">Essay Tags</h3>
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {essayTags.map(tag => (
                    <div key={tag.id} className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2">
                      {editingTagId === tag.id ? (
                         <>
                          <input type="text" value={editingTagName} onChange={(e) => setEditingTagName(e.target.value)} className="flex-grow px-2 py-1 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"/>
                          <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><CheckIcon className="h-5 w-5"/></button>
                        </>
                      ) : (
                        <>
                          <div className="flex-grow"><TagComponent name={tag.name} color={tag.color} /></div>
                          <button onClick={() => handleStartEdit(tag)} className="p-1.5 text-zinc-500 hover:text-green-600 dark:hover:text-green-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><PencilIcon className="h-4 w-4"/></button>
                          <button onClick={() => onRequestDeleteTag(tag.id, tag.name)} className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><TrashIcon className="h-4 w-4"/></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                 {editingTagId && essayTags.some(t => t.id === editingTagId) && (
                  <div className="p-3 mt-2 rounded-md bg-zinc-50 dark:bg-zinc-900/50">
                    <ColorPicker selectedColor={editingTagColor} onSelectColor={setEditingTagColor} />
                    <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:underline mt-2">Cancel Edit</button>
                  </div>
                )}
                 <div className="mt-4">
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Create New Essay Tag</h4>
                  <div className="flex gap-2 items-center">
                    <input type="text" value={newEssayTagName} onChange={(e) => setNewEssayTagName(e.target.value)}
                      placeholder="e.g. 'Why Us?', 'Extracurricular'"
                      className="flex-grow px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"
                    />
                    <button type="button" onClick={() => handleAddNewTag('essay')}
                      className="p-2 bg-green-700 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800">
                      <PlusIcon className="h-5 w-5"/>
                    </button>
                  </div>
                  <div className="mt-3"><ColorPicker selectedColor={newEssayTagColor} onSelectColor={setNewEssayTagColor} /></div>
                </div>
              </div>

            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-700/50 px-6 py-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Done
            </button>
          </div>
      </div>
    </div>
  );
}

export default ManageTagsModal;