import React, { useRef, useState } from "react";

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  spotlightSize = 400,
  printMode = false
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused || printMode) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    if (printMode) return;
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    if (printMode) return;
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    if (printMode) return;
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    if (printMode) return;
    setOpacity(0);
  };

  const cardStyle = printMode 
    ? { background: "#fff", border: "1px solid #e5e7eb" }
    : {};

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
      style={cardStyle}
    >
      {!printMode && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out pdf-hide"
          style={{
            opacity,
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent ${spotlightSize}px)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export default SpotlightCard; 