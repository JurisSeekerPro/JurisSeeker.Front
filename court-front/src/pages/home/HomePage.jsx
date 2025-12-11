// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CaseCard from "../../components/CaseCard";
import Pagination from "../../components/Pagination";
import SearchFilters from "../../components/filters/SearchFilters";
import "../../styles/components.css";

// Базовый запрос с минимальными полями
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
    judgeName: "",
    dateFrom: "",
    dateTo: "",
    hasDecision: null,
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const casesPerPage = 10;

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

    console.log("=== GRAPHQL ЗАПРОС ===");
    console.log("Переменные:", JSON.stringify(filterVars, null, 2));
    console.log("Активные фильтры:", activeFilters);
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
      console.log("Получено дел:", res.courtCases?.edges?.length || 0);
    },
    onError: (err) => {
      console.error("GraphQL ошибка:", err.message);
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
    
    // Диапазон дат - только если есть обе даты
    if (searchFilters.dateFrom && searchFilters.dateTo) {
      safeFilters.dateFrom = searchFilters.dateFrom;
      safeFilters.dateTo = searchFilters.dateTo;
    }
    
    console.log("Применяемые фильтры:", safeFilters);
    
    setActiveFilters(safeFilters);
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
      judgeName: "",
      dateFrom: "",
      dateTo: "",
      hasDecision: null,
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

      {/* Состояние после поиска */}
      {searchPerformed && (
        <>
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
        </>
      )}
    </div>
  );
}