import React from 'react';

const AnimatedList = ({ items = [], onItemSelect = () => {}, className = '' }) => (
  <div className={`border rounded ${className}`}>
    <div className="max-h-60 overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onItemSelect(item, index)}
          className="p-3 hover:bg-gray-100 cursor-pointer border-b"
        >
          {typeof item === 'string' ? item : item.label || JSON.stringify(item)}
        </div>
      ))}
    </div>
  </div>
);

export default AnimatedList; 