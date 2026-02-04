// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CaseCard from "../../components/CaseCard";
import Pagination from "../../components/Pagination";
import SearchFilters from "../../components/filters/SearchFilters";
import "../../styles/components.css";

// Константы для значений исхода дела (числовые для фронтенда, строковые для GraphQL)
const CASE_OUTCOME_VALUES = {
  UNKNOWN: 0,
  PLAINTIFF_WON: 1,
  DEFENDANT_WON: 2,
  SETTLEMENT: 3,
  CASE_DISMISSED: 4,
  PARTIALLY_GRANTED: 5
};

// Функция для преобразования числового значения в строковый GraphQL enum
const getOutcomeGraphQLValue = (value) => {
  if (value === null || value === undefined) return null;
  
  switch(value) {
    case 0: return "UNKNOWN";
    case 1: return "PLAINTIFF_WON";
    case 2: return "DEFENDANT_WON";
    case 3: return "SETTLEMENT";
    case 4: return "CASE_DISMISSED";
    case 5: return "PARTIALLY_GRANTED";
    default: return "UNKNOWN";
  }
};

// Опции для выпадающего списка исхода дела
const OUTCOME_OPTIONS = [
  { value: null, label: "Любой исход" },
  { value: CASE_OUTCOME_VALUES.PLAINTIFF_WON, label: "Истец выиграл" },
  { value: CASE_OUTCOME_VALUES.DEFENDANT_WON, label: "Ответчик выиграл" },
  { value: CASE_OUTCOME_VALUES.SETTLEMENT, label: "Мировое соглашение" },
  { value: CASE_OUTCOME_VALUES.CASE_DISMISSED, label: "Дело прекращено" },
  { value: CASE_OUTCOME_VALUES.PARTIALLY_GRANTED, label: "Частично удовлетворено" },
  { value: CASE_OUTCOME_VALUES.UNKNOWN, label: "Неизвестно" },
];

// Базовые фильтры
const DEFAULT_FILTERS = {
  searchText: "",
  caseNumber: "",
  plaintiff: "",
  defendant: "",
  regions: [],
  judgeName: "",
  dateFrom: "",
  dateTo: "",
  hasDecision: null,
  outcome: null,
};

// Правильная сериализация с кодированием
const serializeFilters = (filters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      // Просто сохраняем как строку через запятую
      params.set(key, value.join(','));
    } else if (value !== null && value !== undefined && value !== '' && value !== false) {
      if (typeof value === 'boolean') {
        params.set(key, value ? 'true' : 'false');
      } else if (typeof value === 'number') {
        // Для чисел сохраняем как строку
        params.set(key, value.toString());
      } else {
        // НЕ кодируем - React Router сделает это сам
        params.set(key, String(value));
      }
    }
  });
  
  return params;
};

// Правильная десериализация с декодированием
const deserializeFilters = (searchParams) => {
  const filters = { ...DEFAULT_FILTERS };
  
  for (const [key, value] of searchParams.entries()) {
    if (key in DEFAULT_FILTERS) {
      if (Array.isArray(DEFAULT_FILTERS[key])) {
        filters[key] = value ? value.split(',') : [];
      } else if (typeof DEFAULT_FILTERS[key] === 'boolean' || key === 'hasDecision') {
        filters[key] = value === 'true' ? true : (value === 'false' ? false : null);
      } else if (key === 'outcome') {
        // Для outcome преобразуем строку в число или null
        const num = parseInt(value, 10);
        filters[key] = isNaN(num) ? null : num;
      } else {
        filters[key] = value;
      }
    }
  }
  
  return filters;
};

// Функция для плавного скролла к элементу
const smoothScrollToElement = (element, duration = 600) => {
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = elementPosition - startPosition;
  
  // Если расстояние маленькое - скроллим сразу
  if (Math.abs(distance) < 50) {
    window.scrollTo(0, elementPosition);
    return;
  }
  
  let startTime = null;
  
  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };
  
  // Функция easing для плавности
  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
  
  requestAnimationFrame(animation);
};

const GET_COURT_CASES_SIMPLE = gql`
  query GetCourtCasesSimple(
    $first: Int
    $after: String
  ) {
    courtCases(
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          caseNumber
          plaintiff
          defendant
          region
          startDate
          receivedDate
          hasDecision
          judgeName
          courtType
          outcome
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`;

const flattenEdges = (edges) => (edges ? edges.map((e) => e.node) : []);

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Ref для контейнера с результатами поиска
  const resultsContainerRef = useRef(null);
  const prevPageRef = useRef(1);
  
  // Загружаем фильтры из URL при инициализации
  const [filters, setFilters] = useState(() => deserializeFilters(searchParams));
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const casesPerPage = 10;

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    const newParams = serializeFilters(filters);
    
    // Добавляем страницу
    if (page > 1) {
      newParams.set('page', page.toString());
    }
    
    // Обновляем URL - React Router сам позаботится о кодировании
    setSearchParams(newParams, { replace: true });
  }, [filters, page, setSearchParams]);

  // Восстанавливаем состояние из URL при загрузке страницы
  useEffect(() => {
    const paramsFilters = deserializeFilters(searchParams);
    setFilters(paramsFilters);
    
    // Проверяем, есть ли активные фильтры
    const hasActiveFilters = Object.keys(paramsFilters).some(key => {
      const value = paramsFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined && value !== '' && value !== false;
    });
    
    // Восстанавливаем страницу
    const savedPage = searchParams.get('page');
    if (savedPage) {
      const pageNum = parseInt(savedPage, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }
    
    // Если есть фильтры - выполняем поиск
    if (hasActiveFilters) {
      // Формируем safeFilters для поиска
      const safeFilters = {};
      
      if (paramsFilters.caseNumber?.trim()) {
        safeFilters.caseNumber = paramsFilters.caseNumber.trim();
      }
      
      if (paramsFilters.plaintiff?.trim()) {
        safeFilters.plaintiff = paramsFilters.plaintiff.trim();
      }
      
      if (paramsFilters.defendant?.trim()) {
        safeFilters.defendant = paramsFilters.defendant.trim();
      }
      
      if (paramsFilters.judgeName?.trim()) {
        safeFilters.judgeName = paramsFilters.judgeName.trim();
      }
      
      if (paramsFilters.regions?.length > 0) {
        safeFilters.regions = paramsFilters.regions;
      }
      
      if (paramsFilters.hasDecision !== null && paramsFilters.hasDecision !== undefined) {
        safeFilters.hasDecision = paramsFilters.hasDecision;
      }
      
      if (paramsFilters.dateFrom && paramsFilters.dateTo) {
        safeFilters.dateFrom = paramsFilters.dateFrom;
        safeFilters.dateTo = paramsFilters.dateTo;
      }
      
      // Добавляем фильтр по исходу дела
      if (paramsFilters.outcome !== null && paramsFilters.outcome !== undefined) {
        safeFilters.outcome = paramsFilters.outcome;
      }
      
      console.log("Восстановленные фильтры из URL:", safeFilters);
      setActiveFilters(safeFilters);
      setSearchPerformed(true);
    }
  }, []); // Только при монтировании

  // Динамически формируем запрос
  const { query, variables } = useMemo(() => {
    if (!searchPerformed) {
      return { query: null, variables: null };
    }

    const baseVars = { 
      first: casesPerPage, 
      after: page > 1 ? cursors[page - 2] : null 
    };

    const filterConditions = [];
    const filterVars = { ...baseVars };

    // Добавляем фильтры по одному для надежности
    if (activeFilters.regions?.length > 0) {
      // Для GraphQL передаем первый регион (если нужно несколько, нужен оператор `in`)
      filterConditions.push(`region: { eq: $region }`);
      filterVars.region = activeFilters.regions[0];
    }
    
    if (activeFilters.caseNumber?.trim()) {
      filterConditions.push(`caseNumber: { contains: $caseNumber }`);
      filterVars.caseNumber = activeFilters.caseNumber.trim();
    }
    
    if (activeFilters.plaintiff?.trim()) {
      filterConditions.push(`plaintiff: { contains: $plaintiff }`);
      filterVars.plaintiff = activeFilters.plaintiff.trim();
    }
    
    if (activeFilters.defendant?.trim()) {
      filterConditions.push(`defendant: { contains: $defendant }`);
      filterVars.defendant = activeFilters.defendant.trim();
    }
    
    if (activeFilters.judgeName?.trim()) {
      filterConditions.push(`judgeName: { contains: $judgeName }`);
      filterVars.judgeName = activeFilters.judgeName.trim();
    }
    
    if (activeFilters.hasDecision !== null && activeFilters.hasDecision !== undefined) {
      filterConditions.push(`hasDecision: { eq: $hasDecision }`);
      filterVars.hasDecision = activeFilters.hasDecision === true || activeFilters.hasDecision === "true";
    }
    
    // Фильтр по исходу дела - используем строковые значения ENUM для GraphQL
    if (activeFilters.outcome !== null && activeFilters.outcome !== undefined) {
      filterConditions.push(`outcome: { eq: $outcome }`);
      // Преобразуем числовое значение в строковое ENUM значение
      filterVars.outcome = getOutcomeGraphQLValue(activeFilters.outcome);
    }
    
    // Диапазон дат - добавляем только если есть обе даты
    if (activeFilters.dateFrom && activeFilters.dateTo) {
      filterConditions.push(`receivedDate: { gte: $dateFrom, lte: $dateTo }`);
      filterVars.dateFrom = activeFilters.dateFrom;
      filterVars.dateTo = activeFilters.dateTo;
    }

    // Если есть фильтры - используем запрос с фильтрацией, иначе простой запрос
    let dynamicQuery;
    if (filterConditions.length > 0) {
      const whereClause = filterConditions.join("\n        ");
      
      // Формируем динамический запрос
      const queryString = `
        query GetCourtCasesWithFilters(
          $first: Int
          $after: String
          ${filterVars.region ? '$region: String' : ''}
          ${filterVars.caseNumber ? '$caseNumber: String' : ''}
          ${filterVars.plaintiff ? '$plaintiff: String' : ''}
          ${filterVars.defendant ? '$defendant: String' : ''}
          ${filterVars.judgeName ? '$judgeName: String' : ''}
          ${filterVars.hasDecision !== undefined ? '$hasDecision: Boolean' : ''}
          ${filterVars.outcome ? '$outcome: CaseOutcome' : ''}
          ${filterVars.dateFrom ? '$dateFrom: String' : ''}
          ${filterVars.dateTo ? '$dateTo: String' : ''}
        ) {
          courtCases(
            first: $first
            after: $after
            where: {
              ${whereClause}
            }
          ) {
            edges {
              node {
                id
                caseNumber
                plaintiff
                defendant
                region
                startDate
                receivedDate
                hasDecision
                judgeName
                courtType
                outcome
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              endCursor
            }
          }
        }
      `;
      
      dynamicQuery = gql(queryString);
    } else {
      dynamicQuery = GET_COURT_CASES_SIMPLE;
    }

    return { 
      query: dynamicQuery, 
      variables: filterVars 
    };
  }, [activeFilters, page, cursors, searchPerformed]);

  const { loading, error, data, refetch } = useQuery(query || GET_COURT_CASES_SIMPLE, {
    variables,
    skip: !searchPerformed || !query,
    fetchPolicy: "network-only",
    onCompleted: (res) => {
      console.log("Получено дел:", res.courtCases?.edges?.length || 0);
    },
    onError: (err) => {
      console.error("GraphQL ошибка:", err.message);
      console.error("Подробности:", err);
    },
  });

  // Сброс пагинации при новом поиске
  useEffect(() => {
    if (searchPerformed) {
      setPage(1);
      setCursors([]);
    }
  }, [activeFilters]);

  // Эффект для скролла после загрузки данных
  useEffect(() => {
    // Сравниваем текущую страницу с предыдущей
    if (prevPageRef.current !== page && !loading && data) {
      // Ждем немного для гарантии рендера DOM
      setTimeout(() => {
        // Вариант 1: Используем ref для скролла к контейнеру с результатами
        if (resultsContainerRef.current) {
          smoothScrollToElement(resultsContainerRef.current, 1400);
        } else {
          // Вариант 2: Ищем список дел
          const caseList = document.querySelector('.case-list');
          if (caseList) {
            smoothScrollToElement(caseList, 1400);
          } else {
            // Вариант 3: Fallback
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }
      }, 50); // Минимальная задержка для рендера DOM
      
      // Обновляем предыдущую страницу
      prevPageRef.current = page;
    }
  }, [loading, data, page]);

  const handlePageChange = (newPage) => {
    if (newPage > page && data?.courtCases?.pageInfo?.endCursor) {
      const newCursors = [...cursors];
      newCursors[page - 1] = data.courtCases.pageInfo.endCursor;
      setCursors(newCursors);
    }
    setPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters || {});
  };

  const handleSearch = (searchFilters) => {
    console.log("Search with filters:", searchFilters);
    
    // Формируем безопасные фильтры
    const safeFilters = {};
    
    // Добавляем только те фильтры, которые точно есть
    if (searchFilters.caseNumber?.trim()) {
      safeFilters.caseNumber = searchFilters.caseNumber.trim();
    }
    
    if (searchFilters.plaintiff?.trim()) {
      safeFilters.plaintiff = searchFilters.plaintiff.trim();
    }
    
    if (searchFilters.defendant?.trim()) {
      safeFilters.defendant = searchFilters.defendant.trim();
    }
    
    if (searchFilters.judgeName?.trim()) {
      safeFilters.judgeName = searchFilters.judgeName.trim();
    }
    
    if (searchFilters.regions?.length > 0) {
      safeFilters.regions = searchFilters.regions;
    }
    
    if (searchFilters.hasDecision !== null && searchFilters.hasDecision !== undefined) {
      safeFilters.hasDecision = searchFilters.hasDecision;
    }
    
    // Добавляем фильтр по исходу дела (числовое значение)
    if (searchFilters.outcome !== null && searchFilters.outcome !== undefined) {
      safeFilters.outcome = searchFilters.outcome;
    }
    
    // Диапазон дат - только если есть обе даты
    if (searchFilters.dateFrom && searchFilters.dateTo) {
      safeFilters.dateFrom = searchFilters.dateFrom;
      safeFilters.dateTo = searchFilters.dateTo;
    }
    
    console.log("Применяемые фильтры:", safeFilters);
    
    setActiveFilters(safeFilters);
    setSearchPerformed(true);
    setFilters(searchFilters);
  };

  const handleClearSearch = () => {
    setActiveFilters({});
    setSearchPerformed(false);
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setCursors([]);
    
    // Очищаем URL-параметры
    setSearchParams({}, { replace: true });
  };

  const currentCases = flattenEdges(data?.courtCases?.edges);
  const pageInfo = data?.courtCases?.pageInfo;

  return (
    <div className="page-container">
      <h1 className="text-title mb-lg">Судебные дела</h1>

      <SearchFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        compact={false}
        outcomeOptions={OUTCOME_OPTIONS}
      />

      {/* Состояние после поиска */}
      {searchPerformed && (
        <div ref={resultsContainerRef}>
          {loading && (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
              <p className="mt-4">Загрузка судебных дел...</p>
            </div>
          )}
          
          {error && (
            <div className="text-body text-error">
              <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <p className="font-bold">Ошибка загрузки:</p>
                <p className="mt-1">{error.message}</p>
                <p className="mt-1 text-sm">Проверьте параметры фильтрации</p>
                <button 
                  className="button button-primary mt-3"
                  onClick={() => refetch()}
                >
                  Повторить запрос
                </button>
                <button 
                  className="button button-clear ml-2 mt-3"
                  onClick={handleClearSearch}
                >
                  Очистить фильтры
                </button>
              </div>
            </div>
          )}

          {!loading && !error && currentCases && currentCases.length > 0 ? (
            <>
              <div className="results-header" style={{ minHeight: '1px' }}>
                {/* Невидимый элемент для скролла */}
              </div>
              
              <div className="case-list mb-lg">
                {currentCases.map((courtCase) => (
                  <CaseCard key={courtCase.id} courtCase={courtCase} />
                ))}
              </div>
              
              <Pagination
                currentPage={page}
                hasNextPage={pageInfo?.hasNextPage}
                hasPreviousPage={pageInfo?.hasPreviousPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            !loading && !error && (
              <div className="no-results text-center py-12">
                <h3>Ничего не найдено</h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Попробуйте изменить параметры поиска
                </p>
                <div className="space-x-2">
                  <button 
                    className="button button-primary"
                    onClick={handleClearSearch}
                  >
                    Очистить фильтры
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}