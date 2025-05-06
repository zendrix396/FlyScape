import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'medium', color = 'emerald', fullScreen = false }) {
  // Size variants
  const sizes = {
    small: {
      outer: 'h-8 w-8',
      inner: 'h-4 w-4',
    },
    medium: {
      outer: 'h-16 w-16',
      inner: 'h-8 w-8',
    },
    large: {
      outer: 'h-24 w-24',
      inner: 'h-12 w-12',
    }
  };

  // Color variants
  const colors = {
    emerald: {
      light: 'bg-emerald-200',
      dark: 'bg-emerald-600',
    },
    blue: {
      light: 'bg-blue-200',
      dark: 'bg-blue-600',
    },
    gray: {
      light: 'bg-gray-200',
      dark: 'bg-gray-600',
    }
  };

  const selectedSize = sizes[size] || sizes.medium;
  const selectedColor = colors[color] || colors.emerald;

  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const bounce = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const fadeInOut = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        variants={containerVariants}
        animate="animate"
        className={`${selectedSize.outer} rounded-full ${selectedColor.light} flex items-center justify-center`}
      >
        <div className={`${selectedSize.inner} rounded-full ${selectedColor.dark}`}></div>
      </motion.div>
      <motion.p 
        variants={fadeInOut}
        animate="animate"
        className="mt-4 text-gray-600 font-medium"
      >
        Loading...
      </motion.p>
    </div>
  );

  // Return full screen version if requested
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {spinner}
      </div>
    );
  }

  // Return regular spinner
  return spinner;
} 