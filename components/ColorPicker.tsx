

import React from 'react';
import { TAG_BG_CLASSES } from '../constants';
import { TAG_COLORS, TagColor } from '../types';
import CheckIcon from './icons/CheckIcon';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: TagColor) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_COLORS.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onSelectColor(color)}
          className={`w-7 h-7 rounded-full flex items-center justify-center ring-offset-2 dark:ring-offset-zinc-800 focus:outline-none focus:ring-2 ring-green-500 ${TAG_BG_CLASSES[color]}`}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && <CheckIcon className="w-5 h-5 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
};
export default ColorPicker;