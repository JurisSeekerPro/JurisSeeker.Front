import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegionSelector from "./RegionSelector";

const SearchFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  onSearch, 
  onClear, 
  compact = false,
  outcomeOptions = []
}) => {
  const [activeSection, setActiveSection] = useState("basic");
  const searchInputRef = useRef(null);

  const sections = {
    basic: { label: "Основные параметры" },
    dates: { label: "Даты" },
    regions: { label: "Регионы" }
  };

  const dateRanges = [
    { label: "За последние 3 месяца", value: "3months" },
    { label: "За последние 6 месяцев", value: "6months" },
    { label: "За текущий год", value: "currentYear" },
    { label: "За прошлый год", value: "lastYear" },
    { label: "Произвольный период", value: "custom" }
  ];

  const defaultOutcomeOptions = outcomeOptions.length > 0 ? outcomeOptions : [
    { value: null, label: "Любой исход" },
    { value: 0, label: "Неизвестно" },
    { value: 1, label: "Истец выиграл" },
    { value: 2, label: "Ответчик выиграл" },
    { value: 3, label: "Мировое соглашение" },
    { value: 4, label: "Дело прекращено" },
    { value: 5, label: "Частично удовлетворено" }
  ];

  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  const handleInputChange = (field, value) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [field]: value });
    }
  };

  const handleArrayToggle = (field, value) => {
    const arr = safeArray(filters[field]);
    const newArr = arr.includes(value) 
      ? arr.filter(x => x !== value) 
      : [...arr, value];
    
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [field]: newArr });
    }
  };

  const handleDateRangeToggle = (value) => {
    const arr = safeArray(filters.dateRanges);
    let newArr;
    
    if (value === "custom") {
      newArr = arr.includes(value) 
        ? arr.filter(x => x !== value) 
        : [...arr, value];
    } else {
      if (arr.includes(value)) {
        newArr = arr.filter(x => x !== value);
      } else {
        newArr = [value, ...arr.filter(x => x === "custom")];
      }
    }
    
    if (onFiltersChange) {
      onFiltersChange({ ...filters, dateRanges: newArr });
    }
  };

  const handleHasDecisionChange = (value) => {
    if (onFiltersChange) {
      onFiltersChange({ 
        ...filters, 
        hasDecision: value === filters.hasDecision ? null : value 
      });
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  const handleClearClick = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const hasActiveFilters = Object.values(filters).some(val =>
    (Array.isArray(val) ? val.length > 0 : val !== "" && val !== null && val !== undefined && val !== false)
  );

  return (
    <div className={`search-filters ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="filters-header">
          <h2>Расширенный поиск</h2>
          <p>Заполните параметры и нажмите "Найти дела" для поиска</p>
        </div>
      )}

      <div className="section-navigation">
        {Object.entries(sections).map(([key, sec]) => (
          <button
            key={key}
            type="button"
            className={`section-tab ${activeSection === key ? "active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div className="section-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "basic" && (
              <div className="section-panel">
                <label className="form-label">Текст для поиска</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ключевые слова, номер дела, описание..."
                  value={filters.searchText || ""}
                  onChange={(e) => handleInputChange("searchText", e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <label className="form-label mt-md">Номер дела</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="А40-123456/2024 или 2-1234/2024"
                  value={filters.caseNumber || ""}
                  onChange={(e) => handleInputChange("caseNumber", e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <label className="form-label mt-md">Судья</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ФИО судьи"
                  value={filters.judgeName || ""}
                  onChange={(e) => handleInputChange("judgeName", e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <label className="form-label mt-md">Истец</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Наименование или ФИО истца"
                  value={filters.plaintiff || ""}
                  onChange={(e) => handleInputChange("plaintiff", e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <label className="form-label mt-md">Ответчик</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Наименование или ФИО ответчика"
                  value={filters.defendant || ""}
                  onChange={(e) => handleInputChange("defendant", e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <label className="form-label mt-md">Исход дела</label>
                <select
                  className="form-input"
                  value={filters.outcome === null || filters.outcome === undefined ? "" : filters.outcome}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("outcome", value === "" ? null : parseInt(value, 10));
                  }}
                >
                  {defaultOutcomeOptions.map((option) => (
                    <option key={option.value === null ? "any" : option.value} value={option.value === null ? "" : option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="mt-md">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasDecision === true}
                      onChange={(e) => handleHasDecisionChange(e.target.checked ? true : null)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">Только дела с решением</span>
                  </label>
                </div>
              </div>
            )}

            {activeSection === "dates" && (
              <div className="section-panel">
                {/* Даты */}
                <label className="form-label">Период поступления дела</label>
                <div className="chips-grid">
                  {dateRanges.map(range => (
                    <button
                      key={range.value}
                      type="button"
                      className={`chip ${safeArray(filters.dateRanges).includes(range.value) ? "active" : ""}`}
                      onClick={() => handleDateRangeToggle(range.value)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {safeArray(filters.dateRanges).includes("custom") && (
                  <div className="custom-dates mt-md">
                    <div className="date-range-group">
                      <div className="date-input-group">
                        <label className="form-label-sm">Дата поступления с</label>
                        <input
                          type="date"
                          className="form-input"
                          value={filters.dateFrom || ""}
                          onChange={(e) => handleInputChange("dateFrom", e.target.value)}
                        />
                      </div>
                      <div className="date-input-group">
                        <label className="form-label-sm">Дата поступления по</label>
                        <input
                          type="date"
                          className="form-input"
                          value={filters.dateTo || ""}
                          onChange={(e) => handleInputChange("dateTo", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "regions" && (
              <div className="section-panel">
                <label className="form-label">Регион рассмотрения</label>
                <RegionSelector
                  selectedRegions={safeArray(filters.regions)}
                  onRegionsChange={(arr) => handleInputChange("regions", arr)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="filters-actions">
        <button 
          type="button"
          className="button button-clear" 
          onClick={handleClearClick}
        >
          Очистить фильтры
        </button>
        <button 
          type="button"
          className="button button-primary" 
          onClick={handleSearchClick}
        >
          Найти дела
        </button>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          {filters.searchText && (
            <span className="active-filter">Текст: "{filters.searchText}"</span>
          )}
          {filters.caseNumber && (
            <span className="active-filter">Дело: {filters.caseNumber}</span>
          )}
          {filters.judgeName && (
            <span className="active-filter">Судья: {filters.judgeName}</span>
          )}
          {filters.plaintiff && (
            <span className="active-filter">Истец: {filters.plaintiff}</span>
          )}
          {filters.defendant && (
            <span className="active-filter">Ответчик: {filters.defendant}</span>
          )}
          {filters.outcome !== null && filters.outcome !== undefined && (
            <span className="active-filter">
              Исход: {defaultOutcomeOptions.find(o => o.value === filters.outcome)?.label || `Исход ${filters.outcome}`}
            </span>
          )}
          {safeArray(filters.regions).map(r => (
            <span key={r} className="active-filter">Регион: {r}</span>
          ))}
          {safeArray(filters.dateRanges).map(value => {
            const range = dateRanges.find(r => r.value === value);
            return range && (
              <span key={value} className="active-filter">Период: {range.label}</span>
            );
          })}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="active-filter">
              Дата поступления: {filters.dateFrom || "..."} - {filters.dateTo || "..."}
            </span>
          )}
          {filters.hasDecision === true && (
            <span className="active-filter">Только с решением</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;