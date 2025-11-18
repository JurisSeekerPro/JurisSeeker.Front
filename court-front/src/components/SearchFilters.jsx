// src/components/SearchFilters.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FilterSection from './filters/FilterSection';
import TextFilter from './filters/TextFilter';
import SelectFilter from './filters/SelectFilter';
import DateRangeFilter from './filters/DateRangeFilter';

// Моковые данные для демонстрации (потом заменишь на реальные из API)
const mockRegions = [
  { value: 'moscow', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'krasnodar', label: 'Краснодарский край' },
  { value: 'sverdlovsk', label: 'Свердловская область' },
  { value: 'novosibirsk', label: 'Новосибирская область' },
];

const mockCaseTypes = [
  { value: 'arbitration', label: 'Арбитражный суд' },
  { value: 'general', label: 'Суд общей юрисдикции' },
  { value: 'commercial', label: 'Коммерческий суд' },
];

const mockArticles = [
  { value: 'civil', label: 'Гражданские дела' },
  { value: 'criminal', label: 'Уголовные дела' },
  { value: 'administrative', label: 'Административные дела' },
  { value: 'economic', label: 'Хозяйственные споры' },
];

export default function SearchFilters({ filters, onFiltersChange, onSearch }) {
  const [openSections, setOpenSections] = useState({
    basic: true,
    parties: false,
    details: false,
    dates: false,
    legal: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    onFiltersChange({
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
      hasDecision: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && (Array.isArray(value) ? value.length > 0 : value !== '')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-lg"
    >
      <div className="flex-between mb-lg">
        <h2 className="text-subtitle">Расширенный поиск дел</h2>
        {hasActiveFilters && (
          <button 
            onClick={handleReset}
            className="button button-secondary"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Основные параметры поиска */}
      <FilterSection 
        title="🔍 Основные параметры" 
        isOpen={openSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <TextFilter
          label="Текст для поиска"
          value={filters.searchText}
          onChange={(value) => handleFilterChange('searchText', value)}
          placeholder="Введите ключевые слова, тему дела..."
        />
        
        <TextFilter
          label="Номер дела"
          value={filters.caseNumber}
          onChange={(value) => handleFilterChange('caseNumber', value)}
          placeholder="А40-123456/2023"
        />
      </FilterSection>

      {/* Стороны процесса */}
      <FilterSection 
        title="👥 Стороны процесса" 
        isOpen={openSections.parties}
        onToggle={() => toggleSection('parties')}
      >
        <TextFilter
          label="Истец"
          value={filters.plaintiff}
          onChange={(value) => handleFilterChange('plaintiff', value)}
          placeholder="Наименование или ФИО истца"
        />
        
        <TextFilter
          label="Ответчик"
          value={filters.defendant}
          onChange={(value) => handleFilterChange('defendant', value)}
          placeholder="Наименование или ФИО ответчика"
        />
      </FilterSection>

      {/* Детали дела */}
      <FilterSection 
        title="📋 Детали дела" 
        isOpen={openSections.details}
        onToggle={() => toggleSection('details')}
      >
        <SelectFilter
          label="Регион"
          value={filters.regions}
          onChange={(value) => handleFilterChange('regions', value)}
          options={mockRegions}
          multiple={true}
        />
        
        <SelectFilter
          label="Тип суда"
          value={filters.courtTypes}
          onChange={(value) => handleFilterChange('courtTypes', value)}
          options={mockCaseTypes}
          multiple={true}
        />

        <SelectFilter
          label="Наличие решения"
          value={filters.hasDecision}
          onChange={(value) => handleFilterChange('hasDecision', value)}
          options={[
            { value: '', label: 'Не важно' },
            { value: 'true', label: 'С решением' },
            { value: 'false', label: 'Без решения' }
          ]}
        />
      </FilterSection>

      {/* Даты */}
      <FilterSection 
        title="📅 Даты" 
        isOpen={openSections.dates}
        onToggle={() => toggleSection('dates')}
      >
        <DateRangeFilter
          label="Дата поступления дела"
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(value) => handleFilterChange('startDate', value)}
          onEndDateChange={(value) => handleFilterChange('endDate', value)}
        />
        
        <DateRangeFilter
          label="Дата решения"
          startDate={filters.decisionStartDate}
          endDate={filters.decisionEndDate}
          onStartDateChange={(value) => handleFilterChange('decisionStartDate', value)}
          onEndDateChange={(value) => handleFilterChange('decisionEndDate', value)}
        />
      </FilterSection>

      {/* Правовые аспекты */}
      <FilterSection 
        title="⚖️ Правовые аспекты" 
        isOpen={openSections.legal}
        onToggle={() => toggleSection('legal')}
      >
        <SelectFilter
          label="Категория дел / Статьи"
          value={filters.articles}
          onChange={(value) => handleFilterChange('articles', value)}
          options={mockArticles}
          multiple={true}
        />
        
        <TextFilter
          label="Правовые нормы"
          value={filters.legalNorms}
          onChange={(value) => handleFilterChange('legalNorms', value)}
          placeholder="ст. 15 ГК РФ, ст. 395 ГК РФ..."
        />
      </FilterSection>

      {/* Кнопки действий */}
      <div className="flex-between mt-lg pt-md border-top">
        <div className="text-small text-muted">
          {hasActiveFilters ? 'Фильтры активны' : 'Все фильтры сброшены'}
        </div>
        <button 
          onClick={handleSearch}
          className="button"
          disabled={!hasActiveFilters}
        >
          🔍 Применить фильтры
        </button>
      </div>
    </motion.div>
  );
}