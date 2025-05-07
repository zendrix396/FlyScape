"use client"

import React, { useState, useRef, useEffect } from "react";

interface SpotlightEffectProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
  color?: string;
  mode?: "hover" | "follow";
  style?: React.CSSProperties;
}

export function SpotlightEffect({
  children,
  className = "",
  spotlightSize = 500,
  color = "rgba(255, 255, 255, 0.1)",
  mode = "follow",
  style = {},
}: SpotlightEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    setPosition({
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    if (mode === "hover") {
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (mode === "hover" && containerRef.current) {
      const element = containerRef.current;
      const rect = element.getBoundingClientRect();
      setPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  }, [mode]);

  return (
    <div
      ref={containerRef}
      onMouseMove={mode === "follow" ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
      }}
    >
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          opacity,
          left: position.x - spotlightSize / 2,
          top: position.y - spotlightSize / 2,
          width: spotlightSize,
          height: spotlightSize,
          background: `radial-gradient(circle at center, ${color} 0%, transparent 100%)`,
          transform: 'translate3d(0, 0, 0)', // Hardware acceleration
          willChange: 'left, top',
          zIndex: 1,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
} 