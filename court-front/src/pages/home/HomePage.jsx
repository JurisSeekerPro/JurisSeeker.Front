// src/pages/home/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchFilters from "../../components/SearchFilters";
import "../../styles/components.css";

// Начальное состояние фильтров
const initialFilters = {
  searchText: '',
  caseNumber: '',
  plaintiff: '',
  defendant: '',
  regions: [],
  courtTypes: [],
  articles: [],
  startDate: '',
  endDate: '',
  decisionStartDate: '',
  decisionEndDate: '',
  hasDecision: '',
  legalNorms: ''
};

export default function HomePage() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (searchFilters) => {
    // Сохраняем в историю поиска
    const newSearch = {
      filters: searchFilters,
      timestamp: new Date().toISOString(),
      resultCount: 0 // Пока неизвестно
    };
    
    setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]); // Храним последние 5 поисков
    
    // Переходим на страницу результатов с фильтрами
    navigate("/analyze", { 
      state: { 
        filters: searchFilters,
        searchText: searchFilters.searchText || 'Расширенный поиск'
      } 
    });
  };

  const handleQuickSearch = (query) => {
    navigate("/analyze", { 
      state: { 
        term: query,
        filters: { searchText: query }
      } 
    });
  };

  const repeatSearch = (searchItem) => {
    setFilters(searchItem.filters);
    handleSearch(searchItem.filters);
  };

  // Быстрые поисковые запросы
  const quickSearches = [
    { label: "Договор подряда", query: "договор подряда" },
    { label: "Взыскание долга", query: "взыскание долга" },
    { label: "Защита прав потребителей", query: "защита прав потребителей" },
    { label: "Банкротство физических лиц", query: "банкротство физических лиц" },
  ];

  return (
    <div className="container-wide" style={{ minHeight: "100vh", padding: "40px 16px" }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Заголовок */}
        <div className="text-center mb-lg">
          <h1 className="text-title mb-md">
            Анализ судебной практики
          </h1>
          <p className="text-body">
            Найдите нужные судебные дела с помощью расширенного поиска
          </p>
        </div>

        <div className="grid grid-2 gap-xl">
          {/* Основной фильтр */}
          <div>
            <SearchFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />
          </div>

          {/* Боковая панель с быстрыми действиями */}
          <div>
            {/* Быстрый поиск */}
            <div className="card p-lg mb-lg">
              <h3 className="text-section mb-md">🚀 Быстрый поиск</h3>
              <div className="grid gap-sm">
                {quickSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(item.query)}
                    className="button button-outline text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* История поиска */}
            {searchHistory.length > 0 && (
              <div className="card p-lg">
                <h3 className="text-section mb-md">📋 История поиска</h3>
                <div className="space-y-sm">
                  {searchHistory.map((search, index) => (
                    <div 
                      key={index}
                      className="flex-between p-sm cursor-pointer hover:bg-gray-50 rounded"
                      onClick={() => repeatSearch(search)}
                    >
                      <div>
                        <div className="text-small font-medium">
                          {search.filters.searchText || 'Расширенный поиск'}
                        </div>
                        <div className="text-xs text-muted">
                          {new Date(search.timestamp).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <span className="text-xs text-muted">↻</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Статистика */}
            <div className="card p-lg mt-lg">
              <h3 className="text-section mb-md">📊 О системе</h3>
              <div className="space-y-sm text-small">
                <div className="flex-between">
                  <span>Дела в базе:</span>
                  <strong>10,000+</strong>
                </div>
                <div className="flex-between">
                  <span>Период:</span>
                  <strong>2020-2024</strong>
                </div>
                <div className="flex-between">
                  <span>Обновление:</span>
                  <strong>Ежедневно</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}