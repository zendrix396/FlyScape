"use client"

import React, { useState, useRef, useEffect } from 'react';
import { animate } from 'motion';
import { Card, CardContent } from "@/components/ui/card";

interface TiltedCardModernProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  perspective?: number;
  glareEnabled?: boolean;
  glareMaxOpacity?: number;
  cardStyle?: React.CSSProperties;
}

export function TiltedCardModern({
  children,
  className = "",
  intensity = 10,
  perspective = 1000,
  glareEnabled = true,
  glareMaxOpacity = 0.5,
  cardStyle = {}
}: TiltedCardModernProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const updateMousePosition = (e: MouseEvent) => {
      if (!isHovering) return;
      
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setPosition({ x: 0.5, y: 0.5 });
  };

  // Calculate tilt values based on mouse position and intensity
  const tiltX = isHovering ? (position.y - 0.5) * intensity : 0;
  const tiltY = isHovering ? (position.x - 0.5) * -intensity : 0;
  
  // Calculate glare position
  const glareX = position.x * 100;
  const glareY = position.y * 100;
  const glareOpacity = isHovering ? glareMaxOpacity : 0;

  return (
    <Card
      ref={cardRef}
      className={`relative overflow-hidden transform-style-preserve-3d ${className}`}
      style={{
        ...cardStyle,
        transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1, 1, 1)`,
        transition: isHovering ? 'none' : 'transform 500ms ease',
        willChange: 'transform'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="h-full transform-style-preserve-3d z-10 relative">
        {children}
      </CardContent>
      
      {glareEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}), transparent 100%)`,
            transition: isHovering ? 'none' : 'opacity 500ms ease',
          }}
        />
      )}
    </Card>
  );
} 