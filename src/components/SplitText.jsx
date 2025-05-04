import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

export default function SplitText({
  text,
  className = '',
  delay = 150,
  animationFrom = { opacity: 0, transform: 'translate3d(0,50px,0)' },
  animationTo = { opacity: 1, transform: 'translate3d(0,0,0)' },
  easing = 'easeOutQuint',
  threshold = 0.2,
  rootMargin = '-50px',
  onLetterAnimationComplete = () => {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const letters = text.split('');
  const completedLetters = useRef(0);
  
  const getConfigFromEasing = () => {
    switch (easing) {
      case 'easeOutQuint':
        return { ...config.gentle, tension: 200, friction: 40 };
      case 'easeOutCubic':
        return { ...config.gentle, tension: 170, friction: 26 };
      case 'easeOutExpo':
        return { ...config.wobbly, tension: 280, friction: 60 };
      default:
        return config.default;
    }
  };

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );
    
    observer.observe(ref.current);
    
    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  const handleLetterAnimationComplete = () => {
    completedLetters.current += 1;
    if (completedLetters.current === letters.length) {
      onLetterAnimationComplete();
    }
  };

  return (
    <div ref={ref} className={className}>
      {letters.map((letter, index) => (
        <Letter
          key={index}
          letter={letter}
          index={index}
          isVisible={isVisible}
          delay={delay}
          animationFrom={animationFrom}
          animationTo={animationTo}
          config={getConfigFromEasing()}
          onComplete={handleLetterAnimationComplete}
        />
      ))}
    </div>
  );
}

const Letter = ({
  letter,
  index,
  isVisible,
  delay,
  animationFrom,
  animationTo,
  config,
  onComplete,
}) => {
  const props = useSpring({
    to: isVisible ? animationTo : animationFrom,
    from: animationFrom,
    delay: index * delay,
    config,
    onRest: onComplete,
  });

  return (
    <animated.span
      style={{
        ...props,
        display: 'inline-block',
        willChange: 'transform, opacity',
        whiteSpace: letter === ' ' ? 'pre' : 'normal',
      }}
    >
      {letter}
    </animated.span>
  );
}; 