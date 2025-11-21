// src/pages/home/HomePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CaseCard from "../../components/CaseCard";
import Pagination from "../../components/Pagination";
import SearchFilters from "../../components/filters/SearchFilters";
import "../../styles/components.css";

const GET_COURT_CASES = gql`
  query GetCourtCases(
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

  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const casesPerPage = 10;

  const variables = useMemo(() => {
    const where = {};
    
    // Текстовые фильтры с contains
    if (filters.searchText?.trim()) {
      where.or = [
        { title: { contains: filters.searchText.trim() } },
        { description: { contains: filters.searchText.trim() } }
      ];
    }
    
    if (filters.caseNumber?.trim()) {
      where.caseNumber = { contains: filters.caseNumber.trim() };
    }
    
    if (filters.plaintiff?.trim()) {
      where.plaintiff = { contains: filters.plaintiff.trim() };
    }
    
    if (filters.defendant?.trim()) {
      where.defendant = { contains: filters.defendant.trim() };
    }
    
    // Фильтр по регионам
    if (filters.regions?.length) {
      where.region = { in: filters.regions };
    }
    
    // Фильтр по типу суда
    if (filters.courtTypes?.length) {
      where.courtType = { in: filters.courtTypes };
    }
    
    // Фильтр по наличию решения
    if (filters.hasDecision === "yes") {
      where.hasDecision = { eq: true };
    } else if (filters.hasDecision === "no") {
      where.hasDecision = { eq: false };
    }
    
    // Фильтр по дате поступления
    if (filters.startDate || filters.endDate) {
      where.receivedDate = {};
      if (filters.startDate) where.receivedDate.gte = filters.startDate;
      if (filters.endDate) where.receivedDate.lte = filters.endDate;
    }
    
    // Фильтр по дате решения
    if (filters.decisionStartDate || filters.decisionEndDate) {
      where.decisionDate = {};
      if (filters.decisionStartDate) where.decisionDate.gte = filters.decisionStartDate;
      if (filters.decisionEndDate) where.decisionDate.lte = filters.decisionEndDate;
    }
    
    const vars = { 
      first: casesPerPage, 
      after: page > 1 ? cursors[page - 2] : null 
    };
    
    // Добавляем where только если есть фильтры
    if (Object.keys(where).length > 0) {
      vars.where = where;
    }
    
    console.log("GraphQL variables:", vars);
    return vars;
  }, [filters, page, cursors]);

  const { loading, error, data, refetch } = useQuery(GET_COURT_CASES, {
    variables,
    fetchPolicy: "network-only",
    onCompleted: (res) => {
      console.log("GraphQL ответ:", res);
      setInitialLoad(false);
    },
    onError: (err) => {
      console.error("GraphQL ошибка:", err);
      setInitialLoad(false);
    },
  });

  // Сброс пагинации при изменении фильтров
  useEffect(() => {
    setPage(1);
    setCursors([]);
    if (!initialLoad) {
      refetch(variables);
    }
  }, [filters, refetch]);

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
    setFilters(searchFilters);
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
        compact={false}
      />

      {!initialLoad && loading && <p className="text-body">Загрузка судебных дел...</p>}
      {error && (
        <p className="text-body text-error">Ошибка загрузки: {error.message}</p>
      )}

      {currentCases.length > 0 ? (
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
        !loading && !initialLoad && (
          <p className="text-body">Нет судебных дел, соответствующих текущим фильтрам</p>
        )
      )}
    </div>
  );
}