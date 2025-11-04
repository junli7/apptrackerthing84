
import React from 'react';
import { TAG_COLOR_CLASSES } from '../constants';
import { TagColor } from '../types';

interface TagProps {
  name: string;
  color: string;
}

const TagComponent: React.FC<TagProps> = ({ name, color }) => {
  const colorClass = TAG_COLOR_CLASSES[color as TagColor] || TAG_COLOR_CLASSES['zinc'];
  
  return (
    <span className={`inline-block ${colorClass} text-xs font-medium px-2.5 py-1 rounded-full`}>
      {name}
    </span>
  );
};

export default TagComponent;