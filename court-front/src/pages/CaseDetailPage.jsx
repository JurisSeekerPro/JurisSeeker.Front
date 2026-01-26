// src/pages/CaseDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from 'framer-motion';
import './../styles/case-detail.css';
import DecisionText from '../components/DecisionText';

// GraphQL запрос
const GET_COURT_CASE_BY_COURT_CASE_ID = gql`
  query GetCourtCaseByCourtCaseId($courtCaseId: String!) {
    courtCaseByCourtCaseId(courtCaseId: $courtCaseId) {
      courtCaseId
      caseNumber
      title
      courtType
      region
      decisionType
      decisionContent
      link
      originalCaseLink
      hasDecision
      decisionLink
      federalDistrict
      plaintiff
      defendant
      thirdParties
      representatives
      judgeName
      receivedDate
      startDate
      caseCategory
      caseSubcategory
      outcome
      caseResult
      articles {
        articleNumber
        description
        outcome
        part
        point
      }
      movements {
        eventName
        eventResult
        basis
        eventDate
      }
      timestamp
    }
  }
`;

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_COURT_CASE_BY_COURT_CASE_ID, {
    variables: { courtCaseId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const courtCase = data?.courtCaseByCourtCaseId;

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Неверная дата' : 
        date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    } catch {
      return 'Неверная дата';
    }
  };

  // Тексты для исходов
  const getOutcomeText = (outcome) => {
    const outcomes = {
      Unknown: 'Неизвестно',
      PlaintiffWin: 'Выиграл истец',
      DefendantWin: 'Выиграл ответчик',
      PartiallyGranted: 'Частично удовлетворено',
      Dismissed: 'Отказано',
      Returned: 'Возвращено',
      PlaintiffWon: 'Выиграл истец',
      DefendantWon: 'Выиграл ответчик',
      Settlement: 'Мировое соглашение',
      CaseDismissed: 'Дело прекращено'
    };
    return outcomes[outcome] || outcome;
  };

  const getOutcomeClass = (outcome) => {
    if (outcome === 'PlaintiffWin' || outcome === 'PlaintiffWon') return 'success';
    if (outcome === 'DefendantWin' || outcome === 'DefendantWon') return 'danger';
    return 'muted';
  };

  const getArticleOutcomeText = (outcome) => {
    const outcomes = {
      Unknown: '',
      Applied: 'Применена',
      NotApplied: 'Не применена',
      PartiallyApplied: 'Частично применена'
    };
    return outcomes[outcome] || '';
  };

  const getArticleOutcomeClass = (outcome) => {
    if (outcome === 'Applied') return 'applied';
    if (outcome === 'NotApplied') return 'not-applied';
    if (outcome === 'PartiallyApplied') return 'partial';
    return '';
  };

  // Загрузка
  if (loading) {
    return (
      <div className="case-detail-page">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p className="text-body mt-md">Загрузка дела...</p>
          <div className="text-small text-muted mt-sm">
            CourtCaseId: {id}
          </div>
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="case-detail-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title mb-md">Ошибка загрузки</h3>
          <p className="error-message">{error.message}</p>
          
          <div className="debug-info bg-light p-md rounded mb-lg">
            <strong>Детали:</strong>
            <div className="mt-sm">
              <div><strong>CourtCaseId:</strong> {id}</div>
            </div>
          </div>
          
          <div className="button-group">
            <button onClick={() => window.location.reload()} className="button button-primary">
              Повторить запрос
            </button>
            <button onClick={() => navigate('/')} className="button button-outline">
              Назад к поиску
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Не найдено
  if (!courtCase) {
    return (
      <div className="case-detail-page">
        <div className="error-state">
          <h3 className="error-title mb-md">Дело не найдено</h3>
          <p className="error-message">Дело с CourtCaseId {id} не существует в системе</p>
          <button onClick={() => navigate('/')} className="button button-primary">
            Назад к поиску
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="case-detail-page">
      {/* Шапка */}
      <div className="case-header">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            marginBottom: '24px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            color: '#495057',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'inherit',
            outline: 'none',
            lineHeight: '1.5',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
        >
          ← Назад к поиску
        </button>
        
        <h1 
          className="case-title"
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '20px',
            lineHeight: '1.3',
            width: '100%',
            wordBreak: 'break-word'
          }}
        >
          {courtCase.title || `Дело №${courtCase.caseNumber}`}
        </h1>
        
        <div className="case-meta">
          <span className="case-badge">{courtCase.caseNumber}</span>
          {courtCase.courtType && <span className="case-badge secondary">{courtCase.courtType}</span>}
          {courtCase.region && <span className="case-badge outline">{courtCase.region}</span>}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Основной контент */}
        <div className="case-content">
          {/* Левая колонка */}
          <div className="case-left-column">

            {/* Стороны процесса (красивая карточка) */}
            {(courtCase.plaintiff || courtCase.defendant || courtCase.thirdParties || courtCase.representatives) && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Стороны процесса</h2>
                </div>
                <div className="section-body">
                  <div className="names-grid">
                    {courtCase.plaintiff && (
                      <div className="name-card plaintiff">
                        <div className="name-header">
                          <div className="name-icon plaintiff">👤</div>
                          <div className="name-title">Истец</div>
                        </div>
                        <div className="name-content text-multiline">
                          {courtCase.plaintiff.split(';').map((name, index) => (
                            <div key={index} className="name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {courtCase.defendant && (
                      <div className="name-card defendant">
                        <div className="name-header">
                          <div className="name-icon defendant">⚖️</div>
                          <div className="name-title">Ответчик</div>
                        </div>
                        <div className="name-content text-multiline">
                          {courtCase.defendant.split(';').map((name, index) => (
                            <div key={index} className="name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {courtCase.thirdParties && (
                      <div className="name-card third">
                        <div className="name-header">
                          <div className="name-icon third">👥</div>
                          <div className="name-title">Третьи лица</div>
                        </div>
                        <div className="name-content text-multiline">
                          {courtCase.thirdParties.split(';').map((name, index) => (
                            <div key={index} className="name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {courtCase.representatives && (
                      <div className="name-card representative">
                        <div className="name-header">
                          <div className="name-icon representative">👨‍⚖️</div>
                          <div className="name-title">Представители</div>
                        </div>
                        <div className="name-content text-multiline">
                          {courtCase.representatives.split(';').map((name, index) => (
                            <div key={index} className="name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
           

            {/* Хронология дела */}
            {courtCase.movements && courtCase.movements.length > 0 && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Хронология дела</h2>
                </div>
                <div className="section-body">
                  <div className="timeline">
                    {courtCase.movements.map((movement, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-header">
                          <div className="event-name">{movement.eventName}</div>
                          <div className="event-date">{formatDate(movement.eventDate)}</div>
                        </div>
                        {movement.eventResult && (
                          <div className="event-result">
                            <strong>Результат:</strong> {movement.eventResult}
                          </div>
                        )}
                        {movement.basis && (
                          <div className="event-basis">
                            <strong>Основание:</strong> {movement.basis}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

             {/* Текст решения - показываем только если есть решение */}
            {courtCase.hasDecision && courtCase.decisionContent && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {courtCase.decisionType && (
                      <span className="decision-type-badge">{courtCase.decisionType}</span>
                    )}
                  </h2>
                </div>
                <div className="section-body">
                  <DecisionText content={courtCase.decisionContent} />
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка */}
          <div className="case-right-column">
            {/* Детали дела */}
            <div className="case-section">
              <div className="section-header">
                <h2 className="section-title">Детали дела</h2>
              </div>
              <div className="section-body">
                <div className="details-grid">
                  {courtCase.caseCategory && (
                    <div className="detail-row">
                      <div className="detail-label">Категория:</div>
                      <div className="detail-value">{courtCase.caseCategory}</div>
                    </div>
                  )}
                  {courtCase.caseSubcategory && (
                    <div className="detail-row">
                      <div className="detail-label">Подкатегория:</div>
                      <div className="detail-value">{courtCase.caseSubcategory}</div>
                    </div>
                  )}
                  {courtCase.region && (
                    <div className="detail-row">
                      <div className="detail-label">Регион:</div>
                      <div className="detail-value">{courtCase.region}</div>
                    </div>
                  )}
                  {courtCase.federalDistrict && (
                    <div className="detail-row">
                      <div className="detail-label">Федеральный округ:</div>
                      <div className="detail-value">{courtCase.federalDistrict}</div>
                    </div>
                  )}
                  {courtCase.judgeName && (
                    <div className="detail-row">
                      <div className="detail-label">Судья:</div>
                      <div className="detail-value">{courtCase.judgeName}</div>
                    </div>
                  )}
                  {courtCase.receivedDate && (
                    <div className="detail-row">
                      <div className="detail-label">Дата поступления:</div>
                      <div className="detail-value">{formatDate(courtCase.receivedDate)}</div>
                    </div>
                  )}
                  {courtCase.startDate && (
                    <div className="detail-row">
                      <div className="detail-label">Дата начала:</div>
                      <div className="detail-value">{formatDate(courtCase.startDate)}</div>
                    </div>
                  )}
                  
                  {/* Поля, связанные с решением - показываем только если есть решение */}
                  {courtCase.hasDecision && (
                    <>
                      {courtCase.decisionType && (
                        <div className="detail-row">
                          <div className="detail-label">Тип решения:</div>
                          <div className="detail-value">{courtCase.decisionType}</div>
                        </div>
                      )}
                      <div className="detail-row">
                        <div className="detail-label">Исход дела:</div>
                        <div className={`detail-value ${getOutcomeClass(courtCase.outcome)}`}>
                          {getOutcomeText(courtCase.outcome)}
                        </div>
                      </div>
                      {courtCase.caseResult && (
                        <div className="detail-row">
                          <div className="detail-label">Результат:</div>
                          <div className="detail-value">{courtCase.caseResult}</div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Статус решения всегда показываем */}
                  <div className="detail-row">
                    <div className="detail-label">Наличие решения:</div>
                    <div className="detail-value">
                      {courtCase.hasDecision ? (
                        <span style={{ color: '#28a745', fontWeight: '500' }}>
                          ✅ Есть решение
                        </span>
                      ) : (
                        <span style={{ color: '#6c757d', fontWeight: '500' }}>
                          ❌ Решение отсутствует
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ключевые стороны (компактная версия) */}
            {(courtCase.plaintiff || courtCase.defendant) && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Ключевые стороны</h2>
                </div>
                <div className="section-body">
                  <div className="compact-parties">
                    {courtCase.plaintiff && (
                      <div className="compact-party">
                        <div className="compact-party-title plaintiff">Истец</div>
                        <div className="compact-party-content">
                          {courtCase.plaintiff.split(';').map((name, index) => (
                            <div key={index} className="compact-name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {courtCase.defendant && (
                      <div className="compact-party">
                        <div className="compact-party-title defendant">Ответчик</div>
                        <div className="compact-party-content">
                          {courtCase.defendant.split(';').map((name, index) => (
                            <div key={index} className="compact-name-item">
                              {name.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Статьи - показываем всегда, если есть */}
            {courtCase.articles && courtCase.articles.length > 0 && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {courtCase.hasDecision ? 'Примененные статьи' : 'Упомянутые статьи'}
                  </h2>
                </div>
                <div className="section-body">
                  <div className="articles-list">
                    {courtCase.articles.map((article, index) => (
                      <div key={index} className="article-item">
                        <div className="article-header">
                          <div className="article-number">
                            Статья {article.articleNumber}
                          </div>
                          {/* Показываем исход статьи только если есть решение */}
                          {courtCase.hasDecision && article.outcome && article.outcome !== 'Unknown' && (
                            <span className={`article-outcome ${getArticleOutcomeClass(article.outcome)}`}>
                              {getArticleOutcomeText(article.outcome)}
                            </span>
                          )}
                        </div>
                        {article.description && (
                          <div className="article-desc">{article.description}</div>
                        )}
                        {(article.part || article.point) && (
                          <div className="article-meta">
                            {[article.part, article.point].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ссылки */}
            {(courtCase.link || courtCase.originalCaseLink || (courtCase.hasDecision && courtCase.decisionLink)) && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Ссылки</h2>
                </div>
                <div className="section-body">
                  <div className="links-grid">
                    {courtCase.link && (
                      <a 
                        href={courtCase.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="case-link"
                      >
                        <span className="link-text">
                          <span className="link-icon">🔗</span>
                          Карточка дела
                        </span>
                        <span className="link-arrow">→</span>
                      </a>
                    )}
                    {courtCase.originalCaseLink && (
                      <a 
                        href={courtCase.originalCaseLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="case-link"
                      >
                        <span className="link-text">
                          <span className="link-icon">📋</span>
                          Оригинальное дело
                        </span>
                        <span className="link-arrow">→</span>
                      </a>
                    )}
                    {/* Ссылку на решение показываем только если есть решение */}
                    {courtCase.hasDecision && courtCase.decisionLink && (
                      <a 
                        href={courtCase.decisionLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="case-link"
                      >
                        <span className="link-text">
                          <span className="link-icon">📄</span>
                          Текст решения
                        </span>
                        <span className="link-arrow">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}