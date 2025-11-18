// src/pages/CaseDetailPage.jsx
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/components.css';

export default function CaseDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const courtCase = state?.courtCase;

  if (!courtCase) {
    return (
      <div className="page-container text-center">
        <p className="text-body mb-md">Дело не найдено</p>
        <button onClick={() => navigate('/analyze')} className="button">
          Вернуться к поиску
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

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

  return (
    <div className="page-container">
      <button 
        onClick={() => navigate('/analyze')}
        className="button-link mb-lg"
      >
        ← Назад к результатам
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fade-in"
      >
        {/* Заголовок */}
        <div className="mb-xl">
          <h1 className="text-subtitle mb-md">
            {courtCase.title}
          </h1>
          <div className="flex flex-wrap gap-md">
            <span className="badge badge-primary">
              {courtCase.caseNumber}
            </span>
            <span className="badge badge-secondary">
              {courtCase.courtType}
            </span>
          </div>
        </div>

        <div className="grid grid-2 gap-lg">
          {/* Левая колонка - основная информация */}
          <div>
            {/* Описание */}
            <div className="mb-lg">
              <h3 className="text-section mb-md">Описание дела</h3>
              <p className="text-body">
                {courtCase.description}
              </p>
            </div>

            {/* Стороны процесса */}
            <div className="mb-lg">
              <h3 className="text-section mb-md">Стороны процесса</h3>
              <div className="card-details">
                <div className="mb-md">
                  <strong className="text-success">Истец:</strong>
                  <p className="text-body mt-sm">{courtCase.plaintiff}</p>
                </div>
                <div className="mb-md">
                  <strong className="text-danger">Ответчик:</strong>
                  <p className="text-body mt-sm">{courtCase.defendant}</p>
                </div>
                {courtCase.thirdParties && (
                  <div>
                    <strong>Третьи лица:</strong>
                    <p className="text-body mt-sm">{courtCase.thirdParties}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Суть спора */}
            <div className="mb-lg">
              <h3 className="text-section mb-md">Суть спора</h3>
              <p className="text-body">{courtCase.subject}</p>
            </div>
          </div>

          {/* Правая колонка - детали */}
          <div>
            {/* Детали дела */}
            <div className="card-details mb-lg">
              <h3 className="text-section mb-md">Детали дела</h3>
              
              <div className="grid-auto">
                <div><strong>Категория:</strong> {courtCase.caseCategory}</div>
                <div><strong>Подкатегория:</strong> {courtCase.caseSubcategory}</div>
                <div><strong>Федеральный округ:</strong> {courtCase.federalDistrict}</div>
                <div><strong>Регион:</strong> {courtCase.region}</div>
                <div><strong>Дата поступления:</strong> {formatDate(courtCase.receivedDate)}</div>
                <div><strong>Дата начала:</strong> {formatDate(courtCase.startDate)}</div>
                {courtCase.decisionDate && (
                  <div><strong>Дата решения:</strong> {formatDate(courtCase.decisionDate)}</div>
                )}
                <div className={courtCase.outcome === 'PlaintiffWin' ? 'text-success' : 
                               courtCase.outcome === 'DefendantWin' ? 'text-danger' : 'text-muted'}>
                  <strong>Исход дела:</strong> {getOutcomeText(courtCase.outcome)}
                </div>
                {courtCase.caseResult && (
                  <div><strong>Результат:</strong> {courtCase.caseResult}</div>
                )}
              </div>
            </div>

            {/* Ссылки */}
            <div className="mb-lg">
              <h3 className="text-section mb-md">Ссылки</h3>
              <div className="flex flex-col gap-sm">
                <a 
                  href={courtCase.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-outline text-center"
                >
                  🔗 Карточка дела
                </a>
                {courtCase.decisionLink && (
                  <a 
                    href={courtCase.decisionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-outline text-center"
                    style={{ borderColor: '#28a745', color: '#28a745' }}
                  >
                    📄 Текст решения
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Движения дела */}
        {courtCase.movements && courtCase.movements.length > 0 && (
          <div className="mt-lg">
            <h3 className="text-section mb-md">Движения дела</h3>
            <div className="card">
              {courtCase.movements.map((movement, index) => (
                <div 
                  key={index}
                  className={`p-md ${index % 2 === 0 ? 'bg-light' : ''} ${
                    index < courtCase.movements.length - 1 ? 'border-bottom' : ''
                  }`}
                >
                  <div className="flex-between mb-sm">
                    <strong className="text-body">{movement.eventName}</strong>
                    <span className="text-small text-muted">
                      {formatDate(movement.eventDate)}
                    </span>
                  </div>
                  {movement.eventResult && (
                    <div className="text-body mb-sm">
                      <strong>Результат:</strong> {movement.eventResult}
                    </div>
                  )}
                  {movement.basis && (
                    <div className="text-small text-muted">
                      <strong>Основание:</strong> {movement.basis}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}