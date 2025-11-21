// src/pages/AnalyzePage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CaseCard from "../components/CaseCard";
import Pagination from "../components/Pagination";

const ActiveFilters = ({ filters, onClearFilter }) => {
  const activeFilters = [];
  if (filters?.searchText) activeFilters.push({ key: 'searchText', label: `Текст: "${filters.searchText}"` });
  if (filters?.caseNumber) activeFilters.push({ key: 'caseNumber', label: `Номер: ${filters.caseNumber}` });
  if (filters?.plaintiff) activeFilters.push({ key: 'plaintiff', label: `Истец: ${filters.plaintiff}` });
  if (filters?.defendant) activeFilters.push({ key: 'defendant', label: `Ответчик: ${filters.defendant}` });

  if (activeFilters.length === 0) return null;

  return (
    <div className="card card-compact mb-lg">
      <div className="flex-between mb-sm">
        <span className="text-section">Активные фильтры:</span>
        <button onClick={() => onClearFilter('all')} className="button-link text-small">Очистить все</button>
      </div>
      <div className="flex flex-wrap gap-sm">
        {activeFilters.map((filter, index) => (
          <span key={index} className="badge badge-primary cursor-pointer" onClick={() => onClearFilter(filter.key)}>
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
  const filters = state?.filters || {};
  const initialCases = state?.cases || [];

  const [currentCases, setCurrentCases] = useState(initialCases);

  const handleClearFilter = (key) => {
    if (key === 'all') {
      navigate("/", { state: { filters: {} } });
    } else {
      const newFilters = { ...filters };
      delete newFilters[key];
      navigate("/", { state: { filters: newFilters } });
    }
  };

  const getPageTitle = () => {
    if (filters?.searchText) return `Результаты поиска: "${filters.searchText}"`;
    if (Object.keys(filters).length > 0) return "Результаты фильтрации";
    return "Все судебные дела";
  };

  return (
    <div className="page-container">
      <div className="mb-lg">
        <div className="flex-between mb-md">
          <h1 className="text-title">{getPageTitle()}</h1>
          <button onClick={() => navigate("/")} className="button button-outline">✏️ Изменить поиск</button>
        </div>
        <ActiveFilters filters={filters} onClearFilter={handleClearFilter} />
      </div>

      {currentCases.length > 0 ? (
        <div className="mb-lg">
          {currentCases.map((courtCase) => (
            <CaseCard key={courtCase.id} courtCase={courtCase} />
          ))}
        </div>
      ) : (
        <div className="card text-center p-lg">
          <p className="text-body mb-sm">По вашему запросу не найдено судебных дел</p>
          <button onClick={() => navigate("/")} className="button">Изменить параметры поиска</button>
        </div>
      )}
    </div>
  );
}
