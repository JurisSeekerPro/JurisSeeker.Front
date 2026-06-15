import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import "./../styles/case-detail.css";
import DecisionText from "../components/DecisionText";

const GET_COURT_CASE_BY_ID = gql`
  query GetCourtCaseById($id: ID!) {
    courtCaseById(id: $id) {
      id
      caseNumber
      title
      courtType
      region
      decisionType
      decisionContentHtml
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
      movements {
        eventName
        eventResult
        basis
        eventDate
      }
      updatedAt
    }
  }
`;

const formatToGuid = (id) => {
  if (!id) return id;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (/^[0-9a-f]{32}$/i.test(id)) {
    return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`.toLowerCase();
  }
  return id;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString === 'string' && dateString.toLowerCase() === '-infinity') {
    return null;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    if (year === 1 && month === 0 && day === 1) return null;
    if (year === 1970 && month === 0 && day === 1) return null;
    if (year < 1900) return null;
    
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formattedId = formatToGuid(id);

  const { loading, error, data } = useQuery(GET_COURT_CASE_BY_ID, {
    variables: { id: formattedId },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const courtCase = data?.courtCaseById;

  const parseOutcomeValue = (outcome) => {
    if (!outcome) return { text: "Неизвестно" };
    const outcomeStr = String(outcome).toUpperCase().trim();
    const outcomeMap = {
      'UNKNOWN': 'Неизвестно',
      'PLAINTIFF_WON': 'Истец выиграл',
      'DEFENDANT_WON': 'Ответчик выиграл',
      '0': 'Неизвестно',
      '1': 'Истец выиграл',
      '2': 'Ответчик выиграл',
      'PLAINTIFFWIN': 'Истец выиграл',
      'DEFENDANTWIN': 'Ответчик выиграл'
    };
    return { text: outcomeMap[outcomeStr] || `Неизвестный исход (${outcome})` };
  };

  const outcomeInfo = courtCase ? parseOutcomeValue(courtCase.outcome) : { text: "Неизвестно" };


  const getDecisionIcon = (decisionType) => {
    switch (decisionType) {
      case "Определение": return "📋";
      case "Постановление": return "⚖️";
      case "Приговор": return "⚖️";
      default: return "📄";
    }
  };

  if (loading) {
    return (
      <div className="case-detail-page">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p className="text-body mt-md">Загрузка дела...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-detail-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title mb-md">Ошибка загрузки</h3>
          <p className="error-message">{error.message}</p>
          <div className="button-group">
            <button onClick={() => window.location.reload()} className="button button-primary">
              Повторить запрос
            </button>
            <button onClick={() => navigate("/")} className="button button-outline">
              Назад к поиску
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courtCase) {
    return (
      <div className="case-detail-page">
        <div className="error-state">
          <h3 className="error-title mb-md">Дело не найдено</h3>
          <p className="error-message">Дело с указанным ID не существует в системе</p>
          <button onClick={() => navigate("/")} className="button button-primary">
            Назад к поиску
          </button>
        </div>
      </div>
    );
  }

  const sideSections = [
    { type: 'plaintiff', content: courtCase.plaintiff },
    { type: 'defendant', content: courtCase.defendant },
    { type: 'third', content: courtCase.thirdParties },
    { type: 'representative', content: courtCase.representatives }
  ].filter(section => section.content);

  const sideCount = sideSections.length;

  return (
    <div key={id} className="case-detail-page">
      <div className="case-header">
        <button onClick={() => navigate("/")} className="back-button">
          ← Назад к поиску
        </button>
        <h1 className="case-title">
          {courtCase.title || `Дело №${courtCase.caseNumber}`}
        </h1>
        <div className="case-meta">
          <span className="case-badge">{courtCase.caseNumber}</span>
          {courtCase.courtType && (
            <span className="case-badge secondary">{courtCase.courtType}</span>
          )}
          {courtCase.region && (
            <span className="case-badge outline">{courtCase.region}</span>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="case-content">
          <div className="case-left-column">
            {sideCount > 0 && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Стороны процесса</h2>
                </div>
                <div className="section-body">
                  <div className={`names-grid ${sideCount === 4 ? 'names-grid-4' : ''}`}>
                    {courtCase.plaintiff && (
                      <div className="name-card plaintiff">
                        <div className="name-header">
                          <div className="name-icon plaintiff">👤</div>
                          <div className="name-title">Истец</div>
                        </div>
                        <div className="name-content text-multiline">
                          {courtCase.plaintiff.split(";").map((name, index) => (
                            <div key={index} className="name-item">{name.trim()}</div>
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
                          {courtCase.defendant.split(";").map((name, index) => (
                            <div key={index} className="name-item">{name.trim()}</div>
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
                          {courtCase.thirdParties.split(";").map((name, index) => (
                            <div key={index} className="name-item">{name.trim()}</div>
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
                          {courtCase.representatives.split(";").map((name, index) => (
                            <div key={index} className="name-item">{name.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {courtCase.movements && courtCase.movements.length > 0 && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Хронология дела</h2>
                </div>
                <div className="section-body">
                  <div className="timeline">
                    {courtCase.movements.map((movement, index) => {
                      const formattedDate = formatDate(movement.eventDate);
                      return (
                        <div key={index} className="timeline-item">
                          <div className="timeline-header">
                            <div className="event-name">{movement.eventName}</div>
                            {formattedDate && <div className="event-date">{formattedDate}</div>}
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
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {courtCase.hasDecision && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">{courtCase.decisionType}</h2>
                </div>
                <div className="section-body">
                  {courtCase.decisionContentHtml ? (
                    <DecisionText content={courtCase.decisionContentHtml} />
                  ) : courtCase.decisionLink ? (
                    <div className="decision-link-container">
                      <a
                        href={courtCase.decisionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="decision-external-link"
                      >
                        <div className="decision-link-content">
                          <div className="decision-link-icon">{getDecisionIcon(courtCase.decisionType)}</div>
                          <div className="decision-link-text">
                            <div className="decision-link-title">
                              {courtCase.decisionType || "Решение"} доступно по ссылке
                            </div>
                          </div>
                          <div className="decision-link-arrow">↗</div>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className="no-decision-text">
                      <div className="no-decision-icon">📄</div>
                      <div className="no-decision-message">
                        Текст {courtCase.decisionType?.toLowerCase() || "решения"} недоступен
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="case-right-column">
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
                  
                  {formatDate(courtCase.receivedDate) && (
                    <div className="detail-row">
                      <div className="detail-label">Дата поступления:</div>
                      <div className="detail-value">{formatDate(courtCase.receivedDate)}</div>
                    </div>
                  )}
                  
                  {formatDate(courtCase.startDate) && (
                    <div className="detail-row">
                      <div className="detail-label">Дата начала:</div>
                      <div className="detail-value">{formatDate(courtCase.startDate)}</div>
                    </div>
                  )}

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
                        <div className="detail-value">{outcomeInfo.text}</div>
                      </div>
                      {courtCase.caseResult && (
                        <div className="detail-row">
                          <div className="detail-label">Результат:</div>
                          <div className="detail-value">{courtCase.caseResult}</div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="detail-row">
                    <div className="detail-label">Наличие решения:</div>
                    <div className="detail-value">
                      {courtCase.hasDecision ? (
                        <span className="text-success">✅ Есть решение</span>
                      ) : (
                        <span className="text-muted">❌ Решение отсутствует</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                          {courtCase.plaintiff.split(";").map((name, index) => (
                            <div key={index} className="compact-name-item">{name.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {courtCase.defendant && (
                      <div className="compact-party">
                        <div className="compact-party-title defendant">Ответчик</div>
                        <div className="compact-party-content">
                          {courtCase.defendant.split(";").map((name, index) => (
                            <div key={index} className="compact-name-item">{name.trim()}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          

            {(courtCase.link || courtCase.originalCaseLink) && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">Ссылки</h2>
                </div>
                <div className="section-body">
                  <div className="links-grid">
                    {courtCase.link && (
                      <a href={courtCase.link} target="_blank" rel="noopener noreferrer" className="case-link">
                        <span className="link-text">
                          <span className="link-icon">🔗</span> Карточка дела
                        </span>
                        <span className="link-arrow">→</span>
                      </a>
                    )}
                    {courtCase.originalCaseLink && (
                      <a href={courtCase.originalCaseLink} target="_blank" rel="noopener noreferrer" className="case-link">
                        <span className="link-text">
                          <span className="link-icon">📋</span> Оригинальное дело
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