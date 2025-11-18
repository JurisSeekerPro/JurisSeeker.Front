// src/pages/AnalyzePage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CaseCard from "../components/CaseCard";
import Pagination from "../components/Pagination";
import "../styles/components.css";

const GET_CASES_MEDIUM = gql`
  query GetCourtCasesMedium($first: Int, $after: String) {
    courtCases(first: $first, after: $after) {
      edges {
        node {
          id
          title
          caseNumber
          courtType
          description
          plaintiff
          defendant
          region
          hasDecision
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

const flattenEdges = (edges) => {
  if (!edges) return [];
  return edges.map(edge => edge.node);
};

// Компонент для отображения активных фильтров
const ActiveFilters = ({ filters, onClearFilter }) => {
  const activeFilters = [];
  
  if (filters?.searchText) {
    activeFilters.push({ key: 'searchText', label: `Текст: "${filters.searchText}"` });
  }
  if (filters?.caseNumber) {
    activeFilters.push({ key: 'caseNumber', label: `Номер: ${filters.caseNumber}` });
  }
  if (filters?.plaintiff) {
    activeFilters.push({ key: 'plaintiff', label: `Истец: ${filters.plaintiff}` });
  }
  if (filters?.defendant) {
    activeFilters.push({ key: 'defendant', label: `Ответчик: ${filters.defendant}` });
  }
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="card card-compact mb-lg">
      <div className="flex-between mb-sm">
        <span className="text-section">Активные фильтры:</span>
        <button 
          onClick={() => onClearFilter('all')}
          className="button-link text-small"
        >
          Очистить все
        </button>
      </div>
      <div className="flex flex-wrap gap-sm">
        {activeFilters.map((filter, index) => (
          <span 
            key={index}
            className="badge badge-primary cursor-pointer"
            onClick={() => onClearFilter(filter.key)}
            title="Нажмите для удаления"
          >
            {filter.label} ×
          </span>
        ))}
      </div>
    </div>
  );
};

export default function AnalyzePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const term = state?.term || "";
  const initialFilters = state?.filters || {};
  
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const casesPerPage = 10;

  const { loading, error, data } = useQuery(GET_CASES_MEDIUM, {
    variables: {
      first: casesPerPage,
      after: page > 1 ? cursors[page - 2] : undefined,
    }
  });

  const handlePageChange = (newPage) => {
    if (newPage > page && data?.courtCases?.pageInfo?.endCursor) {
      const newCursors = [...cursors];
      newCursors[page - 1] = data.courtCases.pageInfo.endCursor;
      setCursors(newCursors);
    }
    setPage(newPage);
  };

  const handleClearFilter = (filterKey) => {
    if (filterKey === 'all') {
      setFilters({});
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[filterKey];
        return newFilters;
      });
    }
  };

  const handleEditSearch = () => {
    navigate("/", { state: { filters } });
  };

  const currentCases = flattenEdges(data?.courtCases?.edges);
  const pageInfo = data?.courtCases?.pageInfo;

  // Определяем заголовок на основе типа поиска
  const getPageTitle = () => {
    if (term && !filters.searchText) {
      return `Результаты поиска: "${term}"`;
    } else if (filters.searchText) {
      return `Результаты расширенного поиска: "${filters.searchText}"`;
    } else if (Object.keys(filters).length > 0) {
      return `Результаты фильтрации`;
    } else {
      return "Все судебные дела";
    }
  };

  if (loading) return (
    <div className="page-container text-center">
      <p className="text-body">Загрузка судебных дел...</p>
    </div>
  );
  
  if (error) return (
    <div className="page-container text-center">
      <p className="text-body mb-md">Ошибка загрузки данных: {error.message}</p>
      <p className="text-small text-muted">
        Попробуйте обновить страницу или уменьшить сложность запроса
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="button mt-md"
      >
        Обновить страницу
      </button>
    </div>
  );

  return (
    <div className="page-container">
      {/* Заголовок и управление поиском */}
      <div className="mb-lg">
        <div className="flex-between mb-md">
          <h1 className="text-title">
            {getPageTitle()}
            <span className="text-muted text-section">
              (Страница {page})
            </span>
          </h1>
          {(term || Object.keys(filters).length > 0) && (
            <button 
              onClick={handleEditSearch}
              className="button button-outline"
            >
              ✏️ Изменить поиск
            </button>
          )}
        </div>
        
        {/* Активные фильтры */}
        <ActiveFilters 
          filters={filters} 
          onClearFilter={handleClearFilter}
        />
      </div>

      {currentCases.length > 0 ? (
        <div>
          <div className="mb-lg">
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
        </div>
      ) : (
        <div className="card text-center p-lg">
          <p className="text-body mb-sm">
            {term || Object.keys(filters).length > 0 
              ? "По вашему запросу не найдено судебных дел" 
              : "Нет доступных судебных дел"
            }
          </p>
          <p className="text-small text-muted mb-md">
            Попробуйте изменить параметры поиска или использовать другие фильтры
          </p>
          <button 
            onClick={handleEditSearch}
            className="button"
          >
            Изменить параметры поиска
          </button>
        </div>
      )}
    </div>
  );
}