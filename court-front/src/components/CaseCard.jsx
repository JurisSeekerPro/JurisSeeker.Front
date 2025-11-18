// src/components/CaseCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CaseCard({ courtCase }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div 
      onClick={() => navigate(`/case/${courtCase.id}`)}
      style={{
        border: '1px solid #e1e5e9',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
        {truncateText(courtCase.title, 100)}
      </h3>
      
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{
          backgroundColor: '#f0f7ff',
          color: '#0066cc',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {courtCase.caseNumber}
        </span>
        <span style={{
          backgroundColor: '#f8f9fa',
          color: '#495057',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {courtCase.courtType}
        </span>
      </div>

      <p style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
        {truncateText(courtCase.description, 120)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
        <div><strong>Истец:</strong> {truncateText(courtCase.plaintiff, 30)}</div>
        <div><strong>Ответчик:</strong> {truncateText(courtCase.defendant, 30)}</div>
        <div><strong>Регион:</strong> {courtCase.region}</div>
        <div><strong>Дата:</strong> {formatDate(courtCase.receivedDate)}</div>
      </div>

      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <span style={{ color: '#0066cc', fontSize: '14px' }}>
          📖 Подробнее
        </span>
      </div>
    </motion.div>
  );
}