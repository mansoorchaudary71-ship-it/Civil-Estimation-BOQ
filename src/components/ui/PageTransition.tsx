import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1], // Custom premium cubic-bezier ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
