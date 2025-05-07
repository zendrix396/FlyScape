"use client"

import React, { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in';
  threshold?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollReveal({
  children,
  animation = 'fade-in',
  threshold = 0.1,
  delay = 0,
  duration = 600,
  once = true,
  className = '',
  style = {}
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            hasAnimated.current = true;
            observer.disconnect();
          }
        } else if (!once && !hasAnimated.current) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Get animation styles
  const getAnimationStyles = () => {
    const baseStyles = {
      opacity: 0,
      transform: 'none',
      transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
      transitionDelay: `${delay}ms`,
    };
    
    const visibleStyles = {
      opacity: 1,
      transform: 'none',
    };
    
    let initialStyles = { ...baseStyles };
    
    switch (animation) {
      case 'slide-up':
        initialStyles.transform = 'translateY(30px)';
        break;
      case 'slide-down':
        initialStyles.transform = 'translateY(-30px)';
        break;
      case 'slide-left':
        initialStyles.transform = 'translateX(30px)';
        break;
      case 'slide-right':
        initialStyles.transform = 'translateX(-30px)';
        break;
      case 'zoom-in':
        initialStyles.transform = 'scale(0.9)';
        break;
      default:
        // fade-in (default)
        break;
    }
    
    return isVisible ? { ...initialStyles, ...visibleStyles } : initialStyles;
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        ...getAnimationStyles(),
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
} 