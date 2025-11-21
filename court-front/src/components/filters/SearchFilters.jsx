// src/components/filters/SearchFilters.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegionSelector from "./RegionSelector";

const SearchFilters = ({ filters = {}, onFiltersChange, onSearch, compact = false }) => {
  const [activeSection, setActiveSection] = useState("basic");

  const sections = {
    basic: { label: "Основные параметры" },
    parties: { label: "Стороны процесса" },
    court: { label: "Суд и даты" },
    legal: { label: "Правовые нормы" }
  };

  const courtTypes = [
    "Арбитражный суд", "Суд общей юрисдикции", "Мировой суд",
    "Районный суд", "Областной суд", "Верховный суд"
  ];

  const legalArticles = [
    "ГК РФ Статья 434", "ГК РФ Статья 450", "ГК РФ Статья 451",
    "АПК РФ Статья 125", "ГПК РФ Статья 131", "КоАП РФ Статья 14.1"
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

  const clearFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
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
    }
  };

  const hasActiveFilters = Object.values(filters).some(val =>
    (Array.isArray(val) ? val.length > 0 : val !== "" && val !== null && val !== undefined)
  );

  const handleQuickDate = (field, period) => {
    const today = new Date();
    let date;
    switch (period) {
      case "today":
        date = today;
        break;
      case "week":
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        break;
      case "month":
        date = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break;
      case "year":
        date = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break;
      default:
        date = today;
    }
    handleInputChange(field, date.toISOString().split("T")[0]);
  };

  return (
    <div className={`search-filters ${compact ? "compact" : ""}`}>
      {!compact && (
        <div className="filters-header">
          <h2>Расширенный поиск</h2>
          <p>Уточните параметры для точного поиска судебных дел</p>
        </div>
      )}

      {/* Навигация по секциям */}
      <div className="section-navigation">
        {Object.entries(sections).map(([key, sec]) => (
          <button
            key={key}
            className={`section-tab ${activeSection === key ? "active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Секции */}
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
                  placeholder="Ключевые слова или описание"
                  value={filters.searchText || ""}
                  onChange={(e) => handleInputChange("searchText", e.target.value)}
                />

                <label className="form-label mt-md">Номер дела</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="А40-123456/2024 или 2-1234/2024"
                  value={filters.caseNumber || ""}
                  onChange={(e) => handleInputChange("caseNumber", e.target.value)}
                />

                <label className="form-label mt-md">Правовые нормы</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ст. 15 ГК РФ, п. 3 ст. 401 ГК РФ..."
                  value={filters.legalNorms || ""}
                  onChange={(e) => handleInputChange("legalNorms", e.target.value)}
                />
              </div>
            )}

            {activeSection === "parties" && (
              <div className="section-panel">
                <label className="form-label">Истец</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Наименование или ФИО истца"
                  value={filters.plaintiff || ""}
                  onChange={(e) => handleInputChange("plaintiff", e.target.value)}
                />

                <label className="form-label mt-md">Ответчик</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Наименование или ФИО ответчика"
                  value={filters.defendant || ""}
                  onChange={(e) => handleInputChange("defendant", e.target.value)}
                />

                <label className="form-label mt-md">Регион рассмотрения</label>
                <RegionSelector
                  selectedRegions={safeArray(filters.regions)}
                  onRegionsChange={(arr) => handleInputChange("regions", arr)}
                />
              </div>
            )}

            {activeSection === "court" && (
              <div className="section-panel">
                <label className="form-label">Тип суда</label>
                <div className="chips-grid">
                  {courtTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`chip ${safeArray(filters.courtTypes).includes(type) ? "active" : ""}`}
                      onClick={() => handleArrayToggle("courtTypes", type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <label className="form-label mt-md">Дата принятия дела</label>
                <div className="quick-dates">
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("startDate", "today")}
                  >
                    Сегодня
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("startDate", "week")}
                  >
                    Неделя
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("startDate", "month")}
                  >
                    Месяц
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("startDate", "year")}
                  >
                    Год
                  </button>
                </div>
                <div className="date-inputs">
                  <input
                    type="date"
                    className="form-input"
                    value={filters.startDate || ""}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                  <span className="date-separator">—</span>
                  <input
                    type="date"
                    className="form-input"
                    value={filters.endDate || ""}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>

                <label className="form-label mt-md">Дата решения</label>
                <div className="quick-dates">
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("decisionStartDate", "today")}
                  >
                    Сегодня
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("decisionStartDate", "week")}
                  >
                    Неделя
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("decisionStartDate", "month")}
                  >
                    Месяц
                  </button>
                  <button
                    type="button"
                    className="quick-date"
                    onClick={() => handleQuickDate("decisionStartDate", "year")}
                  >
                    Год
                  </button>
                </div>
                <div className="date-inputs">
                  <input
                    type="date"
                    className="form-input"
                    value={filters.decisionStartDate || ""}
                    onChange={(e) => handleInputChange("decisionStartDate", e.target.value)}
                  />
                  <span className="date-separator">—</span>
                  <input
                    type="date"
                    className="form-input"
                    value={filters.decisionEndDate || ""}
                    onChange={(e) => handleInputChange("decisionEndDate", e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeSection === "legal" && (
              <div className="section-panel">
                <label className="form-label">Статьи и нормы</label>
                <div className="chips-grid">
                  {legalArticles.map(article => (
                    <button
                      key={article}
                      type="button"
                      className={`chip ${safeArray(filters.articles).includes(article) ? "active" : ""}`}
                      onClick={() => handleArrayToggle("articles", article)}
                    >
                      {article}
                    </button>
                  ))}
                </div>

                <label className="form-label mt-md">Наличие решения</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasDecision"
                      value=""
                      checked={(filters.hasDecision || "") === ""}
                      onChange={(e) => handleInputChange("hasDecision", e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Не важно
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasDecision"
                      value="yes"
                      checked={(filters.hasDecision || "") === "yes"}
                      onChange={(e) => handleInputChange("hasDecision", e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    С решением
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasDecision"
                      value="no"
                      checked={(filters.hasDecision || "") === "no"}
                      onChange={(e) => handleInputChange("hasDecision", e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Без решения
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Кнопки действий */}
      <div className="filters-actions">
        {hasActiveFilters && (
          <button 
            type="button"
            className="button button-clear" 
            onClick={clearFilters}
          >
            Очистить фильтры
          </button>
        )}
        <button 
          type="button"
          className="button button-primary" 
          onClick={() => onSearch && onSearch(filters)}
        >
          Найти дела
        </button>
      </div>

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="active-filters">
          {filters.searchText && (
            <span className="active-filter">Текст: "{filters.searchText}"</span>
          )}
          {filters.caseNumber && (
            <span className="active-filter">Дело: {filters.caseNumber}</span>
          )}
          {filters.plaintiff && (
            <span className="active-filter">Истец: {filters.plaintiff}</span>
          )}
          {filters.defendant && (
            <span className="active-filter">Ответчик: {filters.defendant}</span>
          )}
          {safeArray(filters.regions).map(r => (
            <span key={r} className="active-filter">Регион: {r}</span>
          ))}
          {safeArray(filters.courtTypes).map(t => (
            <span key={t} className="active-filter">Суд: {t}</span>
          ))}
          {safeArray(filters.articles).map(a => (
            <span key={a} className="active-filter">Статья: {a}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;