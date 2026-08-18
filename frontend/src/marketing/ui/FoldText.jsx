import React from 'react';
import { motion } from 'framer-motion';

/**
 * FoldText component - React Bits standard 3D origami folding text animation
 */
export default function FoldText({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  duration = 0.7,
  threshold = 0.2,
}) {
  // If text is a string, split by lines first or characters
  const lines = typeof text === 'string' ? text.split('\n') : [text];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      rotateX: -90,
      y: 20,
      transformOrigin: 'top center',
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // Apple-like smooth cubic bezier
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ perspective: 1000 }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
    >
      {lines.map((line, lIdx) => (
        <span key={lIdx} className="inline-block whitespace-normal">
          {typeof line === 'string' ? (
            line.split(' ').map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
                {word.split('').map((char, cIdx) => (
                  <motion.span
                    key={cIdx}
                    variants={letterVariants}
                    className="inline-block backface-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))
          ) : (
            line
          )}
          {lIdx < lines.length - 1 && <br />}
        </span>
      ))}
    </motion.span>
  );
}
