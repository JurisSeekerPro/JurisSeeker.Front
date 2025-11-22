// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CaseCard from "../../components/CaseCard";
import Pagination from "../../components/Pagination";
import SearchFilters from "../../components/filters/SearchFilters";
import "../../styles/components.css";

// Запрос без фильтрации для начальной загрузки
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
          title
          caseNumber
          courtType
          plaintiff
          defendant
          region
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

// Запрос с фильтрацией
const GET_COURT_CASES_WITH_FILTERS = gql`
  query GetCourtCasesWithFilters(
    $first: Int
    $after: String
    $region: String
    $courtType: String
    $caseNumber: String
  ) {
    courtCases(
      first: $first
      after: $after
      where: {
        ${"" /* Фильтры будут добавлены динамически */}
      }
    ) {
      edges {
        node {
          id
          title
          caseNumber
          courtType
          plaintiff
          defendant
          region
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
  const [filters, setFilters] = useState({
    searchText: "",
    caseNumber: "",
    plaintiff: "",
    defendant: "",
    regions: [],
    courtTypes: [],
    articles: [],
    startDate: "",
    endDate: "",
    decisionStartDate: "",
    decisionEndDate: "",
    hasDecision: "",
    legalNorms: ""
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const casesPerPage = 10;

  // Динамически формируем запрос в зависимости от наличия фильтров
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

    // Добавляем фильтры только если они есть
    if (activeFilters.regions?.length > 0) {
      filterConditions.push(`region: { eq: $region }`);
      filterVars.region = activeFilters.regions[0];
    }
    
    if (activeFilters.courtTypes?.length > 0) {
      filterConditions.push(`courtType: { eq: $courtType }`);
      filterVars.courtType = activeFilters.courtTypes[0];
    }
    
    if (activeFilters.caseNumber?.trim()) {
      filterConditions.push(`caseNumber: { contains: $caseNumber }`);
      filterVars.caseNumber = activeFilters.caseNumber.trim();
    }

    // Если есть фильтры - используем запрос с фильтрацией, иначе простой запрос
    let dynamicQuery;
    if (filterConditions.length > 0) {
      const whereClause = filterConditions.join("\n        ");
      dynamicQuery = gql`
        query GetCourtCasesWithFilters(
          $first: Int
          $after: String
          ${filterVars.region ? '$region: String' : ''}
          ${filterVars.courtType ? '$courtType: String' : ''}
          ${filterVars.caseNumber ? '$caseNumber: String' : ''}
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
                title
                caseNumber
                courtType
                plaintiff
                defendant
                region
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
    } else {
      dynamicQuery = GET_COURT_CASES_SIMPLE;
    }

    console.log("=== GRAPHQL ЗАПРОС ===");
    console.log("Строка запроса:");
    console.log(dynamicQuery.loc?.source.body);
    console.log("Переменные:", JSON.stringify(filterVars, null, 2));
    console.log("Активные фильтры:", activeFilters);
    console.log("Используется запрос с фильтрами:", filterConditions.length > 0);
    console.log("====================");

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
      console.log("GraphQL ответ:", res);
    },
    onError: (err) => {
      console.error("GraphQL ошибка:", err);
      console.error("Детали ошибки:", err.message);
      console.error("Сетевые детали:", err.networkError);
      console.error("Граф ошибки:", err.graphQLErrors);
    },
  });

  // Сброс пагинации при новом поиске
  useEffect(() => {
    if (searchPerformed) {
      setPage(1);
      setCursors([]);
    }
  }, [activeFilters]);

  const handlePageChange = (newPage) => {
    if (newPage > page && data?.courtCases?.pageInfo?.endCursor) {
      const newCursors = [...cursors];
      newCursors[page - 1] = data.courtCases.pageInfo.endCursor;
      setCursors(newCursors);
    }
    setPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters || {});
  };

  const handleSearch = (searchFilters) => {
    console.log("Search with filters:", searchFilters);
    setActiveFilters(searchFilters);
    setSearchPerformed(true);
  };

  const handleClearSearch = () => {
    setActiveFilters({});
    setSearchPerformed(false);
    setFilters({
      searchText: "",
      caseNumber: "",
      plaintiff: "",
      defendant: "",
      regions: [],
      courtTypes: [],
      articles: [],
      startDate: "",
      endDate: "",
      decisionStartDate: "",
      decisionEndDate: "",
      hasDecision: "",
      legalNorms: ""
    });
    setPage(1);
    setCursors([]);
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
      />

      {/* Состояние до поиска */}
      {!searchPerformed && (
        <div className="search-prompt">
          <div className="prompt-content">
            <h3>Начните поиск судебных дел</h3>
            <p>Заполните фильтры и нажмите кнопку "Найти дела" для отображения результатов</p>
            <div className="prompt-features">
              <div className="feature">
                <span className="feature-icon">🗺️</span>
                <span>Фильтрация по регионам России</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚖️</span>
                <span>Выбор типа суда</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔢</span>
                <span>Поиск по номеру дела</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Состояние после поиска */}
      {searchPerformed && (
        <>
          {loading && <p className="text-body">Загрузка судебных дел...</p>}
          {error && (
            <div className="text-body text-error">
              <p>Ошибка загрузки: {error.message}</p>
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Отладочная информация:</strong>
                <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
                  Проверьте консоль браузера для деталей запроса
                </div>
              </div>
              <button 
                className="button button-primary"
                onClick={() => refetch()}
                style={{marginTop: '10px'}}
              >
                Повторить запрос
              </button>
            </div>
          )}

          {currentCases && currentCases.length > 0 ? (
            <>
              <div className="search-results-header">
                <h2>Результаты поиска</h2>
                <p>Найдено дел: {currentCases.length}</p>
                <button 
                  className="button button-clear"
                  onClick={handleClearSearch}
                >
                  Очистить результаты
                </button>
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
            !loading && (
              <div className="no-results">
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска или очистить фильтры</p>
                <button 
                  className="button button-primary"
                  onClick={handleClearSearch}
                >
                  Очистить поиск
                </button>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}