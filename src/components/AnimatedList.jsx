import React from 'react';

export default function AnimatedList({
  items = [],
  onItemSelect = () => {},
  className = '',
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="max-h-60 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => onItemSelect(item, index)}
            className="p-3 hover:bg-emerald-100 cursor-pointer border-b border-gray-100"
          >
            {typeof item === 'string' ? item : item.label || JSON.stringify(item)}
          </div>
        ))}
      </div>
    </div>
  );
} 