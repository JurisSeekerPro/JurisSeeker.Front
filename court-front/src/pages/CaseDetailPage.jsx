// src/pages/CaseDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import "./../styles/case-detail.css";
import DecisionText from "../components/DecisionText";

// GraphQL запрос для получения дела по ID из PostgreSQL
const GET_COURT_CASE_BY_ID = gql`
  query GetCourtCaseById($id: ID!) {
    courtCaseById(id: $id) {
      id
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
      updatedAt
    }
  }
`;

// Функция для преобразования ID в формат GUID с дефисами
const formatToGuid = (id) => {
  if (!id) return id;
  
  // Если уже в формате GUID с дефисами
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // Если это 32-значный hex без дефисов
  if (/^[0-9a-f]{32}$/i.test(id)) {
    return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`.toLowerCase();
  }
  
  return id;
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Форматируем ID для GraphQL
  const formattedId = formatToGuid(id);

  const { loading, error, data } = useQuery(GET_COURT_CASE_BY_ID, {
    variables: { id: formattedId },
    skip: !id,
    fetchPolicy: "network-only",
  });

  // Правильно получаем данные из GraphQL ответа
  const courtCase = data?.courtCaseById;

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "Не указана";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Неверная дата"
        : date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return "Неверная дата";
    }
  };

  // Функция для парсинга исхода дела
  const parseOutcomeValue = (outcome) => {
    if (outcome === null || outcome === undefined || outcome === "") {
      return { text: "Неизвестно" };
    }

    const outcomeStr = String(outcome).toUpperCase().trim();

    const outcomeMap = {
      'UNKNOWN': 'Неизвестно',
      'PLAINTIFF_WON': 'Истец выиграл',
      'DEFENDANT_WON': 'Ответчик выиграл',
      'SETTLEMENT': 'Мировое соглашение',
      'CASE_DISMISSED': 'Дело прекращено',
      'PARTIALLY_GRANTED': 'Частично удовлетворено',
      
      '0': 'Неизвестно',
      '1': 'Истец выиграл',
      '2': 'Ответчик выиграл',
      '3': 'Мировое соглашение',
      '4': 'Дело прекращено',
      '5': 'Частично удовлетворено',
      
      'PLAINTIFFWIN': 'Истец выиграл',
      'DEFENDANTWIN': 'Ответчик выиграл',
      'PARTIALLYGRANTED': 'Частично удовлетворено',
      'DISMISSED': 'Дело прекращено',
      'RETURNED': 'Возвращено',
    };

    if (outcomeMap[outcomeStr]) {
      return { text: outcomeMap[outcomeStr] };
    }

    return { text: `Неизвестный исход (${outcome})` };
  };

  // Получаем информацию об исходе дела
  const outcomeInfo = courtCase ? parseOutcomeValue(courtCase.outcome) : { text: "Неизвестно" };

  const getArticleOutcomeText = (outcome) => {
    const outcomes = {
      Unknown: "",
      Applied: "Применена",
      NotApplied: "Не применена",
      PartiallyApplied: "Частично применена",
    };
    return outcomes[outcome] || "";
  };

  const getArticleOutcomeClass = (outcome) => {
    if (outcome === "Applied") return "applied";
    if (outcome === "NotApplied") return "not-applied";
    if (outcome === "PartiallyApplied") return "partial";
    return "";
  };

  // Функция для получения иконки по типу решения
  const getDecisionIcon = (decisionType) => {
    switch (decisionType) {
      case "Определение":
        return "📋";
      case "Постановление":
        return "⚖️";
      case "Приговор":
        return "⚖️";
      default:
        return "📄";
    }
  };

  // Загрузка
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

  // Ошибка
  if (error) {
    return (
      <div className="case-detail-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title mb-md">Ошибка загрузки</h3>
          <p className="error-message">{error.message}</p>
          <div className="button-group">
            <button
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
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

  // Не найдено
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

  // Подсчитываем количество сторон для определения стиля
  const sideSections = [
    { type: 'plaintiff', content: courtCase.plaintiff },
    { type: 'defendant', content: courtCase.defendant },
    { type: 'third', content: courtCase.thirdParties },
    { type: 'representative', content: courtCase.representatives }
  ].filter(section => section.content);

  const sideCount = sideSections.length;

  // Успешная загрузка - рендерим данные дела
  return (
    <div key={id} className="case-detail-page">
      {/* Шапка */}
      <div className="case-header">
        <button
          onClick={() => navigate("/")}
          className="back-button"
        >
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
        {/* Основной контент */}
        <div className="case-content">
          {/* Левая колонка */}
          <div className="case-left-column">
            {/* Стороны процесса */}
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
                          {courtCase.defendant.split(";").map((name, index) => (
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
                          {courtCase.thirdParties.split(";").map((name, index) => (
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
                          {courtCase.representatives.split(";").map((name, index) => (
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

            {/* Текст решения */}
            {courtCase.hasDecision && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {courtCase.decisionType && courtCase.decisionType}
                  </h2>
                </div>
                <div className="section-body">
                  {/* Если есть текст решения - показываем его */}
                  {courtCase.decisionContent ? (
                    <DecisionText content={courtCase.decisionContent} />
                  ) : courtCase.decisionLink ? (
                    <div className="decision-link-container">
                      <a
                        href={courtCase.decisionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="decision-external-link"
                      >
                        <div className="decision-link-content">
                          <div className="decision-link-icon">
                            {getDecisionIcon(courtCase.decisionType)}
                          </div>
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
                    /* Если нет ни текста, ни ссылки - сообщение */
                    <div className="no-decision-text">
                      <div className="no-decision-icon">📄</div>
                      <div className="no-decision-message">
                        Текст{" "}
                        {courtCase.decisionType
                          ? courtCase.decisionType.toLowerCase()
                          : "решения"}{" "}
                        недоступен
                      </div>
                    </div>
                  )}
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

                  {/* Поля, связанные с решением */}
                  {courtCase.hasDecision && (
                    <>
                      {courtCase.decisionType && (
                        <div className="detail-row">
                          <div className="detail-label">Тип решения:</div>
                          <div className="detail-value">{courtCase.decisionType}</div>
                        </div>
                      )}

                      {/* ИСХОД ДЕЛА - ключевое поле */}
                      <div className="detail-row">
                        <div className="detail-label">Исход дела:</div>
                        <div className="detail-value">
                          {outcomeInfo.text}
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
                        <span className="text-success">✅ Есть решение</span>
                      ) : (
                        <span className="text-muted">❌ Решение отсутствует</span>
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
                          {courtCase.plaintiff.split(";").map((name, index) => (
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
                          {courtCase.defendant.split(";").map((name, index) => (
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

            {/* Статьи */}
            {courtCase.articles && courtCase.articles.length > 0 && (
              <div className="case-section">
                <div className="section-header">
                  <h2 className="section-title">
                    {courtCase.hasDecision ? "Примененные статьи" : "Упомянутые статьи"}
                  </h2>
                </div>
                <div className="section-body">
                  <div className="articles-list">
                    {courtCase.articles.map((article, index) => (
                      <div key={index} className="article-item">
                        <div className="article-header">
                          <div className="article-number">Статья {article.articleNumber}</div>
                          {/* Показываем исход статьи только если есть решение */}
                          {courtCase.hasDecision &&
                            article.outcome &&
                            article.outcome !== "Unknown" && (
                              <span
                                className={`article-outcome ${getArticleOutcomeClass(
                                  article.outcome
                                )}`}
                              >
                                {getArticleOutcomeText(article.outcome)}
                              </span>
                            )}
                        </div>
                        {article.description && (
                          <div className="article-desc">{article.description}</div>
                        )}
                        {(article.part || article.point) && (
                          <div className="article-meta">
                            {[article.part, article.point].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
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