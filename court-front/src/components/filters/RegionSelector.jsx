// src/components/RegionSelector.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Данные регионов с группировкой по ФО
const regionsData = {
  "Центральный ФО": [
    "Москва", "Московская область", "Белгородская область", "Брянская область",
    "Владимирская область", "Воронежская область", "Ивановская область", 
    "Калужская область", "Костромская область", "Курская область", 
    "Липецкая область", "Орловская область", "Рязанская область", 
    "Смоленская область", "Тамбовская область", "Тверская область", 
    "Тульская область", "Ярославская область"
  ],
  "Северо-Западный ФО": [
    "Санкт-Петербург", "Архангельская область", "Вологодская область", 
    "Калининградская область", "Ленинградская область", "Мурманская область", 
    "Новгородская область", "Псковская область", "Республика Карелия", 
    "Республика Коми"
  ],
  "Южный ФО": [
    "Астраханская область", "Волгоградская область", "Краснодарский край", 
    "Республика Адыгея", "Республика Калмыкия", "Ростовская область"
  ],
  "Приволжский ФО": [
    "Кировская область", "Нижегородская область", "Оренбургская область", 
    "Пензенская область", "Пермский край", "Республика Башкортостан", 
    "Республика Марий Эл", "Республика Мордовия", "Республика Татарстан", 
    "Республика Чувашия", "Самарская область", "Саратовская область", 
    "Удмуртская Республика", "Ульяновская область"
  ],
  "Уральский ФО": [
    "Курганская область", "Свердловская область", "Тюменская область", 
    "Ханты-Мансийский автономный округ", "Челябинская область", 
    "Ямало-Ненецкий автономный округ"
  ],
  "Сибирский ФО": [
    "Алтайский край", "Забайкальский край", "Иркутская область", 
    "Кемеровская область", "Красноярский край", "Новосибирская область", 
    "Омская область", "Республика Алтай", "Республика Бурятия", 
    "Республика Тыва", "Республика Хакасия", "Томская область"
  ],
  "Дальневосточный ФО": [
    "Амурская область", "Еврейская автономная область", "Камчатский край", 
    "Магаданская область", "Приморский край", "Республика Саха (Якутия)", 
    "Сахалинская область", "Хабаровский край", "Чукотский автономный округ"
  ],
  "Северо-Кавказский ФО": [
    "Кабардино-Балкарская Республика", "Карачаево-Черкесская Республика", 
    "Республика Дагестан", "Республика Ингушетия", 
    "Республика Северная Осетия-Алания", "Ставропольский край", 
    "Чеченская Республика"
  ],
  "Крымский ФО": [
    "Город Севастополь", "Республика Крым"
  ]
};

const RegionSelector = ({ selectedRegions, onRegionsChange, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDistricts, setExpandedDistricts] = useState(new Set(["Центральный ФО", "Северо-Западный ФО"]));

  // Фильтрация регионов по поиску
  const filteredRegions = useMemo(() => {
    if (!searchTerm) return regionsData;

    const filtered = {};
    Object.entries(regionsData).forEach(([district, regions]) => {
      const matchingRegions = regions.filter(region =>
        region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingRegions.length > 0) {
        filtered[district] = matchingRegions;
      }
    });
    return filtered;
  }, [searchTerm]);

  const toggleDistrict = (district) => {
    setExpandedDistricts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(district)) {
        newSet.delete(district);
      } else {
        newSet.add(district);
      }
      return newSet;
    });
  };

  const toggleRegion = (region) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    onRegionsChange(newRegions);
  };

  const selectAllInDistrict = (district) => {
    const districtRegions = regionsData[district];
    const allSelected = districtRegions.every(region => selectedRegions.includes(region));
    
    if (allSelected) {
      // Убрать все регионы округа
      const newRegions = selectedRegions.filter(region => !districtRegions.includes(region));
      onRegionsChange(newRegions);
    } else {
      // Добавить все регионы округа
      const newRegions = [...new Set([...selectedRegions, ...districtRegions])];
      onRegionsChange(newRegions);
    }
  };

  const selectAllRegions = () => {
    const allRegions = Object.values(regionsData).flat();
    const allSelected = allRegions.every(region => selectedRegions.includes(region));
    
    if (allSelected) {
      onRegionsChange([]);
    } else {
      onRegionsChange(allRegions);
    }
  };

  const clearAll = () => {
    onRegionsChange([]);
  };

  const selectedCount = selectedRegions.length;
  const totalRegions = Object.values(regionsData).flat().length;

  return (
    <div className={`region-selector ${className}`}>
      {/* Заголовок и управление */}
      <div className="region-header">
        <div className="region-title">
          Выбор регионов
          <span className="region-counter">
            ({selectedCount}/{totalRegions})
          </span>
        </div>
        <div className="region-actions">
          <button 
            className="region-action-btn"
            onClick={selectAllRegions}
            title="Выбрать все регионы"
          >
            Все
          </button>
          <button 
            className="region-action-btn"
            onClick={clearAll}
            title="Очистить выбор"
          >
            Очистить
          </button>
        </div>
      </div>

      {/* Поиск */}
      <div className="region-search">
        <input
          type="text"
          placeholder="Поиск региона..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="region-search-input"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="region-search-clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Список федеральных округов */}
      <div className="districts-list">
        {Object.entries(filteredRegions).map(([district, regions]) => {
          const districtSelectedCount = regions.filter(region => 
            selectedRegions.includes(region)
          ).length;
          const isExpanded = expandedDistricts.has(district);
          const isAllSelected = districtSelectedCount === regions.length;

          return (
            <div key={district} className="district-item">
              {/* Заголовок округа */}
              <div 
                className="district-header"
                onClick={() => toggleDistrict(district)}
              >
                <div className="district-info">
                  <span className={`district-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="district-name">{district}</span>
                  <span className="district-counter">
                    ({districtSelectedCount}/{regions.length})
                  </span>
                </div>
                <button
                  className={`district-select-all ${isAllSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllInDistrict(district);
                  }}
                >
                  {isAllSelected ? '✓' : '+'}
                </button>
              </div>

              {/* Список регионов */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="regions-grid"
                  >
                    {regions.map(region => (
                      <label key={region} className="region-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() => toggleRegion(region)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="region-name">{region}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Быстрый выбор популярных регионов */}
      <div className="popular-regions">
        <div className="popular-title">Популярные регионы:</div>
        <div className="popular-chips">
          {["Москва", "Московская область", "Санкт-Петербург", "Ленинградская область", 
            "Краснодарский край", "Свердловская область", "Новосибирская область", 
            "Республика Татарстан"].map(region => (
            <button
              key={region}
              className={`popular-chip ${selectedRegions.includes(region) ? 'active' : ''}`}
              onClick={() => toggleRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;