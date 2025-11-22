// src/pages/CaseDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from 'framer-motion';

// GraphQL запрос для получения дела по CourtCaseId
const GET_COURT_CASE_BY_COURT_CASE_ID = gql`
  query GetCourtCaseByCourtCaseId($courtCaseId: String!) {
    courtCaseByCourtCaseId(courtCaseId: $courtCaseId) {
      courtCaseId
      caseNumber
      title
      courtType
      region
      decisionDate
      decisionType
      decisionContent
      link
      description
      originalCaseLink
      subject
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
      return isNaN(date.getTime()) ? 'Неверная дата' : date.toLocaleDateString('ru-RU');
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
      Returned: 'Возвращено'
    };
    return outcomes[outcome] || outcome;
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

  // Загрузка
  if (loading) {
    return (
      <div className="page-container text-center">
        <div className="loading-spinner large"></div>
        <p className="text-body mt-md">Загрузка дела...</p>
        <div className="text-small text-muted mt-sm">
          CourtCaseId: {id}
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="page-container text-center">
        <div className="error-state">
          <h3 className="text-error mb-md">Ошибка загрузки</h3>
          <p className="text-body mb-lg">{error.message}</p>
          
          <div className="debug-info">
            <strong>Детали:</strong>
            <div className="mt-sm">
              <div><strong>CourtCaseId:</strong> {id}</div>
            </div>
          </div>
          
          <div className="flex gap-md justify-center mt-lg">
            <button onClick={() => window.location.reload()} className="button button-primary">
              Повторить запрос
            </button>
            <button onClick={() => navigate('/analyze')} className="button button-outline">
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
      <div className="page-container text-center">
        <h3 className="text-subtitle mb-md">Дело не найдено</h3>
        <p className="text-body mb-lg">Дело с CourtCaseId {id} не существует в системе</p>
        <button onClick={() => navigate('/analyze')} className="button button-primary">
          Назад к поиску
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Шапка */}
      <div className="mb-lg">
        <button 
          onClick={() => navigate('/analyze')}
          className="button button-link mb-md"
        >
          ← Назад к поиску
        </button>
        
        <h1 className="text-title mb-md">
          {courtCase.title || `Дело №${courtCase.caseNumber}`}
        </h1>
        
        <div className="flex flex-wrap gap-sm mb-lg">
          <span className="badge badge-primary">{courtCase.caseNumber}</span>
          <span className="badge badge-secondary">{courtCase.courtType}</span>
          {courtCase.region && <span className="badge badge-outline">{courtCase.region}</span>}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Основной контент */}
        <div className="grid grid-2 gap-xl">
          {/* Левая колонка */}
          <div className="space-y-lg">
            {/* Описание */}
            {courtCase.description && (
              <section>
                <h2 className="text-section mb-md">Описание дела</h2>
                <div className="card p-md">
                  <p className="text-body">{courtCase.description}</p>
                </div>
              </section>
            )}

            {/* Суть спора */}
            {courtCase.subject && (
              <section>
                <h2 className="text-section mb-md">Суть спора</h2>
                <div className="card p-md">
                  <p className="text-body">{courtCase.subject}</p>
                </div>
              </section>
            )}

            {/* Текст решения */}
            {courtCase.decisionContent && (
              <section>
                <h2 className="text-section mb-md">Текст решения</h2>
                <div className="card p-md">
                  <div className="decision-content">
                    {courtCase.decisionContent}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Правая колонка */}
          <div className="space-y-lg">
            {/* Детали дела */}
            <section>
              <h2 className="text-section mb-md">Детали дела</h2>
              <div className="card p-md">
                <div className="space-y-sm">
                  {courtCase.caseCategory && (
                    <div className="flex-between">
                      <strong>Категория:</strong>
                      <span>{courtCase.caseCategory}</span>
                    </div>
                  )}
                  {courtCase.caseSubcategory && (
                    <div className="flex-between">
                      <strong>Подкатегория:</strong>
                      <span>{courtCase.caseSubcategory}</span>
                    </div>
                  )}
                  {courtCase.region && (
                    <div className="flex-between">
                      <strong>Регион:</strong>
                      <span>{courtCase.region}</span>
                    </div>
                  )}
                  {courtCase.federalDistrict && (
                    <div className="flex-between">
                      <strong>Федеральный округ:</strong>
                      <span>{courtCase.federalDistrict}</span>
                    </div>
                  )}
                  {courtCase.judgeName && (
                    <div className="flex-between">
                      <strong>Судья:</strong>
                      <span>{courtCase.judgeName}</span>
                    </div>
                  )}
                  {courtCase.receivedDate && (
                    <div className="flex-between">
                      <strong>Дата поступления:</strong>
                      <span>{formatDate(courtCase.receivedDate)}</span>
                    </div>
                  )}
                  {courtCase.startDate && (
                    <div className="flex-between">
                      <strong>Дата начала:</strong>
                      <span>{formatDate(courtCase.startDate)}</span>
                    </div>
                  )}
                  {courtCase.decisionDate && (
                    <div className="flex-between">
                      <strong>Дата решения:</strong>
                      <span>{formatDate(courtCase.decisionDate)}</span>
                    </div>
                  )}
                  {courtCase.decisionType && (
                    <div className="flex-between">
                      <strong>Тип решения:</strong>
                      <span>{courtCase.decisionType}</span>
                    </div>
                  )}
                  <div className="flex-between">
                    <strong>Исход дела:</strong>
                    <span className={
                      courtCase.outcome === 'PlaintiffWin' ? 'text-success' : 
                      courtCase.outcome === 'DefendantWin' ? 'text-danger' : 
                      'text-muted'
                    }>
                      {getOutcomeText(courtCase.outcome)}
                    </span>
                  </div>
                  {courtCase.caseResult && (
                    <div className="flex-between">
                      <strong>Результат:</strong>
                      <span>{courtCase.caseResult}</span>
                    </div>
                  )}
                  <div className="flex-between">
                    <strong>Наличие решения:</strong>
                    <span>{courtCase.hasDecision ? '✅ Есть' : '❌ Нет'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Стороны */}
            <section>
              <h2 className="text-section mb-md">Стороны процесса</h2>
              <div className="card p-md">
                <div className="space-y-md">
                  {courtCase.plaintiff && (
                    <div>
                      <strong className="text-success">Истец:</strong>
                      <p className="text-body mt-xs">{courtCase.plaintiff}</p>
                    </div>
                  )}
                  {courtCase.defendant && (
                    <div>
                      <strong className="text-danger">Ответчик:</strong>
                      <p className="text-body mt-xs">{courtCase.defendant}</p>
                    </div>
                  )}
                  {courtCase.thirdParties && (
                    <div>
                      <strong>Третьи лица:</strong>
                      <p className="text-body mt-xs">{courtCase.thirdParties}</p>
                    </div>
                  )}
                  {courtCase.representatives && (
                    <div>
                      <strong>Представители:</strong>
                      <p className="text-body mt-xs">{courtCase.representatives}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Статьи */}
            {courtCase.articles && courtCase.articles.length > 0 && (
              <section>
                <h2 className="text-section mb-md">Примененные статьи</h2>
                <div className="space-y-sm">
                  {courtCase.articles.map((article, index) => (
                    <div key={index} className="card p-sm">
                      <div className="flex-between mb-xs">
                        <strong>Статья {article.articleNumber}</strong>
                        {article.outcome && article.outcome !== 'Unknown' && (
                          <span className={`badge ${
                            article.outcome === 'Applied' ? 'badge-success' : 
                            article.outcome === 'NotApplied' ? 'badge-error' : 
                            'badge-warning'
                          }`}>
                            {getArticleOutcomeText(article.outcome)}
                          </span>
                        )}
                      </div>
                      {article.description && (
                        <p className="text-small text-muted">{article.description}</p>
                      )}
                      {(article.part || article.point) && (
                        <p className="text-small">
                          {[article.part, article.point].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ссылки */}
            <section>
              <h2 className="text-section mb-md">Ссылки</h2>
              <div className="flex flex-col gap-sm">
                {courtCase.link && (
                  <a href={courtCase.link} target="_blank" rel="noopener noreferrer" className="button button-outline">
                    🔗 Карточка дела
                  </a>
                )}
                {courtCase.originalCaseLink && (
                  <a href={courtCase.originalCaseLink} target="_blank" rel="noopener noreferrer" className="button button-outline">
                    📋 Оригинальное дело
                  </a>
                )}
                {courtCase.decisionLink && (
                  <a href={courtCase.decisionLink} target="_blank" rel="noopener noreferrer" className="button button-outline text-success">
                    📄 Текст решения
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Движения дела */}
        {courtCase.movements && courtCase.movements.length > 0 && (
          <section className="mt-xl">
            <h2 className="text-section mb-md">Хронология дела</h2>
            <div className="card">
              {courtCase.movements.map((movement, index) => (
                <div key={index} className={`p-md ${index % 2 === 0 ? 'bg-light' : ''}`}>
                  <div className="flex-between mb-sm">
                    <strong>{movement.eventName}</strong>
                    <span className="text-small text-muted">
                      {formatDate(movement.eventDate)}
                    </span>
                  </div>
                  {movement.eventResult && (
                    <p className="text-body mb-xs"><strong>Результат:</strong> {movement.eventResult}</p>
                  )}
                  {movement.basis && (
                    <p className="text-small text-muted"><strong>Основание:</strong> {movement.basis}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}