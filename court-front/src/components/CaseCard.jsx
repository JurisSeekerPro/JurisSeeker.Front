import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/case-card.css';

export default function CaseCard({ courtCase }) {
  const navigate = useNavigate();

  const getCaseTitle = () => {
    return courtCase.courtType || 'Судебное дело';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const hasDecision = courtCase.hasDecision === true || courtCase.hasDecision === "true";

  const handleCardClick = (e) => {
    if (e.target.closest('.case-details-btn')) {
      return;
    }
    
    const caseId = courtCase.id;
    if (caseId) {
      navigate(`/case/${caseId}`);
    }
  };

  const handleDetailsClick = () => {
    const caseId = courtCase.id;
    if (caseId) {
      navigate(`/case/${caseId}`);
    }
  };

  return (
    <div 
      className="case-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      <div className="case-header">
        <h3 className="case-title">{getCaseTitle()}</h3>
        <div className="case-number-container">
          <span className="case-number-label">ДЕЛО №</span>
          <span className="case-number-value">
            {courtCase.caseNumber || '—'}
          </span>
        </div>
      </div>
      
      <div className="case-details">
        {courtCase.plaintiff && (
          <div className="detail-row">
            <span className="detail-label">Истец:</span>
            <span className="detail-value">{courtCase.plaintiff}</span>
          </div>
        )}
        
        {courtCase.defendant && (
          <div className="detail-row">
            <span className="detail-label">Ответчик:</span>
            <span className="detail-value">{courtCase.defendant}</span>
          </div>
        )}
        
        {courtCase.region && (
          <div className="detail-row">
            <span className="detail-label">Регион:</span>
            <span className="detail-value">{courtCase.region}</span>
          </div>
        )}
        
        {courtCase.judgeName && courtCase.judgeName.trim() !== "" && (
          <div className="detail-row">
            <span className="detail-label">Судья:</span>
            <span className="detail-value">{courtCase.judgeName}</span>
          </div>
        )}
        
        {courtCase.receivedDate && (
          <div className="detail-row">
            <span className="detail-label">Дата поступления:</span>
            <span className="detail-value">{formatDate(courtCase.receivedDate)}</span>
          </div>
        )}
      </div>
      
      <div className="case-footer">
        <div className="case-decision">
          {hasDecision ? (
            <span className="decision-badge decision-yes" title="Дело имеет решение">
              ✅ Решение вынесено
            </span>
          ) : (
            <span className="decision-badge decision-no" title="Дело рассматривается">
              ⏳ На рассмотрении
            </span>
          )}
        </div>
        
        <button 
          className="case-details-btn"
          onClick={handleDetailsClick}
          aria-label={`Подробнее о деле ${courtCase.caseNumber || ''}`}
        >
          Подробнее
        </button>
      </div>
    </div>
  );
}