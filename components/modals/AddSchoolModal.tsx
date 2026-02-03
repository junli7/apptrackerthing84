import React, { useState } from 'react';
import { Application, Outcome, Tag, TAG_COLORS, TagColor } from '../../types';
import TagComponent from '../Tag';
import PlusIcon from '../icons/PlusIcon';
import ColorPicker from '../ColorPicker';
import ModalWrapper from './ModalWrapper';
import MapPinIcon from '../icons/MapPinIcon';

interface AddSchoolModalProps {
  onClose: () => void;
  onAddSchool: (school: Omit<Application, 'id' | 'notes' | 'checklist'>) => void;
  schoolTags: Tag[];
  onAddTag: (name: string, color: string, type: 'school' | 'essay') => Tag;
}

// Common US college cities with coordinates - exported for use in other components
export const COMMON_LOCATIONS: { city: string; state: string; lat: number; lng: number }[] = [
  { city: 'Cambridge', state: 'MA', lat: 42.3601, lng: -71.0942 },
  { city: 'Stanford', state: 'CA', lat: 37.4275, lng: -122.1697 },
  { city: 'New Haven', state: 'CT', lat: 41.3083, lng: -72.9279 },
  { city: 'Princeton', state: 'NJ', lat: 40.3431, lng: -74.6551 },
  { city: 'Ithaca', state: 'NY', lat: 42.4534, lng: -76.4735 },
  { city: 'Durham', state: 'NC', lat: 35.9940, lng: -78.8986 },
  { city: 'Ann Arbor', state: 'MI', lat: 42.2780, lng: -83.7382 },
  { city: 'Berkeley', state: 'CA', lat: 37.8716, lng: -122.2727 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0689, lng: -118.4452 },
  { city: 'Atlanta', state: 'GA', lat: 33.7756, lng: -84.3963 },
  { city: 'Austin', state: 'TX', lat: 30.2849, lng: -97.7341 },
  { city: 'Chicago', state: 'IL', lat: 41.7886, lng: -87.5987 },
  { city: 'Philadelphia', state: 'PA', lat: 39.9522, lng: -75.1932 },
  { city: 'Boston', state: 'MA', lat: 42.3505, lng: -71.1054 },
  { city: 'New York', state: 'NY', lat: 40.8075, lng: -73.9626 },
  { city: 'Seattle', state: 'WA', lat: 47.6553, lng: -122.3035 },
  { city: 'Providence', state: 'RI', lat: 41.8268, lng: -71.4025 },
  { city: 'Hanover', state: 'NH', lat: 43.7044, lng: -72.2887 },
  { city: 'Evanston', state: 'IL', lat: 42.0565, lng: -87.6753 },
  { city: 'Pasadena', state: 'CA', lat: 34.1377, lng: -118.1253 },
  // Additional college cities
  { city: 'Pittsburgh', state: 'PA', lat: 40.4444, lng: -79.9608 },
  { city: 'Baltimore', state: 'MD', lat: 39.3299, lng: -76.6205 },
  { city: 'West Lafayette', state: 'IN', lat: 40.4259, lng: -86.9081 },
  { city: 'Champaign', state: 'IL', lat: 40.1164, lng: -88.2434 },
  { city: 'Newark', state: 'NJ', lat: 40.7357, lng: -74.1724 },
  { city: 'New Brunswick', state: 'NJ', lat: 40.4862, lng: -74.4518 },
  { city: 'Houston', state: 'TX', lat: 29.7174, lng: -95.4018 },
  { city: 'Nashville', state: 'TN', lat: 36.1447, lng: -86.8027 },
  { city: 'St. Louis', state: 'MO', lat: 38.6488, lng: -90.3108 },
  { city: 'Madison', state: 'WI', lat: 43.0766, lng: -89.4125 },
  { city: 'Columbus', state: 'OH', lat: 40.0067, lng: -83.0305 },
  { city: 'Minneapolis', state: 'MN', lat: 44.9740, lng: -93.2277 },
  { city: 'Charlottesville', state: 'VA', lat: 38.0336, lng: -78.5080 },
  { city: 'San Diego', state: 'CA', lat: 32.8801, lng: -117.2340 },
  { city: 'Santa Barbara', state: 'CA', lat: 34.4133, lng: -119.8610 },
  { city: 'Bloomington', state: 'IN', lat: 39.1653, lng: -86.5264 },
  { city: 'College Park', state: 'MD', lat: 38.9897, lng: -76.9378 },
  { city: 'Amherst', state: 'MA', lat: 42.3732, lng: -72.5199 },
  { city: 'Medford', state: 'MA', lat: 42.4064, lng: -71.1196 },
  { city: 'Waltham', state: 'MA', lat: 42.3765, lng: -71.2356 },
];

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ onClose, onAddSchool, schoolTags, onAddTag }) => {
  const [schoolName, setSchoolName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>(TAG_COLORS[0]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [tuitionCost, setTuitionCost] = useState('');

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

  const handleLocationSelect = (loc: typeof COMMON_LOCATIONS[0]) => {
    setCity(loc.city);
    setState(loc.state);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolName && deadline) {
      const locationData = city && state ? {
        city,
        state,
        ...COMMON_LOCATIONS.find(l => l.city === city && l.state === state) || {}
      } : undefined;

      onAddSchool({
        schoolName,
        deadline,
        outcome: Outcome.IN_PROGRESS,
        tagIds: selectedTagIds,
        location: locationData,
        tuitionCost: tuitionCost ? parseInt(tuitionCost.replace(/[^0-9]/g, '')) : undefined,
      });
      onClose();
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
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

              {/* Location Section */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-zinc-200 dark:border-zinc-600">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  <MapPinIcon className="h-4 w-4" />
                  Location (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="city" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Cambridge"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">State</label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., MA"
                      maxLength={2}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">Quick Select</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {COMMON_LOCATIONS.slice(0, 12).map((loc) => (
                      <button
                        key={`${loc.city}-${loc.state}`}
                        type="button"
                        onClick={() => handleLocationSelect(loc)}
                        className={`px-2 py-1 text-xs rounded-full transition-all ${
                          city === loc.city && state === loc.state
                            ? 'bg-green-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-500'
                        }`}
                      >
                        {loc.city}, {loc.state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tuition Cost */}
              <div>
                <label htmlFor="tuitionCost" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Annual Cost of Attendance (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input
                    type="text"
                    id="tuitionCost"
                    value={tuitionCost}
                    onChange={(e) => setTuitionCost(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g., 75000"
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
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
    </ModalWrapper>
  );
};

export default AddSchoolModal;