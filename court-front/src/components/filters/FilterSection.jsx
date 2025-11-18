// src/components/filters/FilterSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function FilterSection({ title, children, isOpen = true, onToggle }) {
  return (
    <div className="card card-compact">
      <div 
        className="flex-between cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-section">{title}</h3>
        <span>{isOpen ? '▼' : '▶'}</span>
      </div>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-md"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}