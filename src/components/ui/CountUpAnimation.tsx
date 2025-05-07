"use client"

import React, { useState, useEffect, useRef } from 'react';

interface CountUpAnimationProps {
  end: number;
  duration?: number;
  startOnView?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUpAnimation({
  end,
  duration = 2000,
  startOnView = true,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
  style = {}
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnView);
  const counterRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Format number with proper decimals and separators
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return prefix + parts.join('.') + suffix;
  };

  // Setup IntersectionObserver to check when element is in view
  useEffect(() => {
    if (!startOnView || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [startOnView]);

  // Animate the count when visible
  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const startValue = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = progress * (end - startValue) + startValue;
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        hasAnimated.current = true;
      }
    };
    
    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className={className} style={style}>
      {formatNumber(count)}
    </div>
  );
} 