import React, { useState, useEffect } from 'react';

const RotatingText = ({ texts = [], rotationInterval = 2000, mainClassName = '', auto = true }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    if (!auto) return;
    const intervalId = setInterval(() => {
      setCurrentTextIndex(i => (i < texts.length - 1) ? i + 1 : 0);
    }, rotationInterval);
    return () => clearInterval(intervalId);
  }, [texts, rotationInterval, auto]);

  return <span className={`inline-block ${mainClassName}`}>{texts[currentTextIndex]}</span>;
};

RotatingText.displayName = "RotatingText";
export default RotatingText; 