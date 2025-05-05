import React from "react";

const SpotlightCard = ({ children, className = "" }) => (
  <div className={`border border-gray-200 bg-white p-4 ${className}`}>
    {children}
  </div>
);

export default SpotlightCard; 