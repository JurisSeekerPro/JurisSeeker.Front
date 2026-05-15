import React from 'react';
import { motion } from 'framer-motion';

export default function Pagination({ 
  currentPage, 
  hasNextPage, 
  hasPreviousPage, 
  onPageChange 
}) {
  
  const handlePrevious = () => {
    if (hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '16px',
      marginTop: '32px',
      flexWrap: 'wrap'
    }}>
      {/* Кнопка "Назад" */}
      <motion.button
        onClick={handlePrevious}
        disabled={!hasPreviousPage}
        style={{
          padding: '10px 20px',
          border: '1px solid #dee2e6',
          backgroundColor: !hasPreviousPage ? '#f8f9fa' : 'white',
          color: !hasPreviousPage ? '#6c757d' : '#007bff',
          borderRadius: '8px',
          cursor: !hasPreviousPage ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: '120px'
        }}
        whileHover={hasPreviousPage ? { scale: 1.05 } : {}}
        whileTap={hasPreviousPage ? { scale: 0.95 } : {}}
        transition={{ duration: 0.2 }}
      >
        ← Предыдущая
      </motion.button>

      {/* Номер текущей страницы */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        Страница {currentPage}
      </div>

      {/* Кнопка "Вперед" */}
      <motion.button
        onClick={handleNext}
        disabled={!hasNextPage}
        style={{
          padding: '10px 20px',
          border: '1px solid #dee2e6',
          backgroundColor: !hasNextPage ? '#f8f9fa' : 'white',
          color: !hasNextPage ? '#6c757d' : '#007bff',
          borderRadius: '8px',
          cursor: !hasNextPage ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: '120px'
        }}
        whileHover={hasNextPage ? { scale: 1.05 } : {}}
        whileTap={hasNextPage ? { scale: 0.95 } : {}}
        transition={{ duration: 0.2 }}
      >
        Следующая →
      </motion.button>
    </div>
  );
}