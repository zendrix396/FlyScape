import React, { useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export default function CountUp({
  from = 0,
  to = 100,
  duration = 1,
  separator = '',
  direction = 'up',
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(direction === 'up' ? from : to);

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationId;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        const value = direction === 'up'
          ? from + Math.floor((to - from) * progress)
          : to - Math.floor((to - from) * progress);
        setCount(value);
        animationId = requestAnimationFrame(updateCount);
      } else {
        setCount(direction === 'up' ? to : from);
      }
    };

    animationId = requestAnimationFrame(updateCount);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isInView, from, to, duration, direction]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return (
    <span ref={ref} className={className}>
      {formatNumber(count)}
    </span>
  );
} 