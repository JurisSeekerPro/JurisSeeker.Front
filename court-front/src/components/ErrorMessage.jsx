import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card" style={{ borderColor: '#ff4444', background: '#fff5f5' }}>
      <h3 style={{ color: '#ff4444', marginBottom: '12px' }}>Ошибка</h3>
      <p style={{ marginBottom: '16px' }}>{message}</p>
      {onRetry && (
        <button className="button" onClick={onRetry}>
          Попробовать снова
        </button>
      )}
    </div>
  );
}