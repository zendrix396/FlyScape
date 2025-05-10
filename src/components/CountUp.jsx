import React, { useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export default function CountUp({
  from = 0,
  to = 100,
  duration = 1,
  separator = ',',
  direction = 'up',
  className = '',
  decimals = 0,
  prefix = '',
  suffix = '',
  onComplete = () => {},
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Reset count when "from" changes to ensure proper animation start
  useEffect(() => {
    setCount(from);
  }, [from]);

  // Reset animation state when "to" value changes 
  useEffect(() => {
    setHasAnimated(false);
  }, [to]);

  useEffect(() => {
    // Skip animation if values are the same
    if (from === to) {
      setCount(to);
      setHasAnimated(true);
      return;
    }

    // Only animate if in view and not already animated
    if (!isInView || hasAnimated) return;

    let startTime;
    let animationId;
    const startValue = direction === 'up' ? from : to;
    const endValue = direction === 'up' ? to : from;

    // Use a more sophisticated easing function for smoother animation
    const easeOutExpo = t => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);
      
      // Calculate the current value with more precision
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      setCount(currentValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
        setHasAnimated(true);
        onComplete();
      }
    };

    animationId = requestAnimationFrame(updateCount);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isInView, from, to, duration, direction, hasAnimated, onComplete]);

  const formatNumber = (num) => {
    // Handle decimal places
    const fixedNum = parseFloat(num).toFixed(decimals);
    
    // Format with separators (like commas)
    const parts = fixedNum.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return `${prefix}${parts.join('.')}${suffix}`;
  };

  return (
    <span ref={ref} className={className}>
      {formatNumber(count)}
    </span>
  );
} 