import React from 'react';
import Draggable from './Draggable';

interface BasicEventProps {
  id: string;
  label: string;
  position: { x: number; y: number };
  onDragEnd: (id: string, newPosition: { x: number; y: number }) => void;
}

const BasicEvent: React.FC<BasicEventProps> = ({ id, label, position, onDragEnd }) => {
  const handleDragEnd = (newPosition: { x: number; y: number }) => {
    onDragEnd(id, newPosition);
  };

  return (
    <Draggable initialPosition={position} onDragEnd={handleDragEnd}>
      <circle cx="40" cy="40" r="35" fill="green" stroke="black" strokeWidth="2" />
      <text x="40" y="40" alignmentBaseline="middle" textAnchor="middle" fill="black" fontWeight="bold">
        {label}
      </text>
    </Draggable>
  );  
};

export default BasicEvent;
