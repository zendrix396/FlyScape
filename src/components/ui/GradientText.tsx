"use client"

import React, { ElementType } from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  via?: string;
  gradient?: string; // For Tailwind CSS gradient classes
  animate?: boolean;
  animationDuration?: number;
  angle?: number;
  className?: string;
  as?: ElementType;
}

export function GradientText({
  children,
  from = "oklch(0.541 0.281 293.009)",
  to = "oklch(0.706 0.195 223.024)",
  via,
  gradient,
  animate = false,
  animationDuration = 8,
  angle = 90,
  className = "",
  as: Component = "span"
}: GradientTextProps) {
  // If a tailwind gradient class is provided, use that instead of explicit colors
  const gradientStyle = gradient ? {
    backgroundSize: animate ? "200% 200%" : "100% 100%",
    animation: animate ? `gradient ${animationDuration}s linear infinite` : undefined,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    display: "inline-block",
  } : {
    backgroundImage: via
      ? `linear-gradient(${angle}deg, ${from}, ${via}, ${to})`
      : `linear-gradient(${angle}deg, ${from}, ${to})`,
    backgroundSize: animate ? "200% 200%" : "100% 100%",
    animation: animate ? `gradient ${animationDuration}s linear infinite` : undefined,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    display: "inline-block",
  };

  return (
    <Component
      className={`relative ${animate ? "animate-gradient" : ""} ${gradient || ""} ${className}`}
      style={gradientStyle}
    >
      {children}
    </Component>
  );
} 