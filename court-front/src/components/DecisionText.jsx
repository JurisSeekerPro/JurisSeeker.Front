// src/components/DecisionText.jsx
import React, { useState, useEffect, useRef } from 'react';
import './../styles/DecisionText.css';

const DecisionText = ({ content, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  // Определяем, нужна ли кнопка "Показать полностью"
  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textHeight = textRef.current.scrollHeight;
      const containerHeight = containerRef.current.clientHeight;
      setNeedsExpansion(textHeight > 600); // Если текст больше 600px по высоте
    }
  }, [content]);

  // Обработка строк с форматированием
  const renderFormattedLine = (line, index) => {
    // Очищаем лишние пробелы
    line = line.trim();
    if (!line) return null;

    // Обнаруживаем заголовки
    if (line.match(/^### .* ###$/)) {
      const text = line.replace(/^### (.*) ###$/, '$1');
      return (
        <h3 key={index} className="decision-header">
          {text}
        </h3>
      );
    }

    // Обнаруживаем подзаголовки
    if (line.match(/^==== .* ====$/)) {
      const text = line.replace(/^==== (.*) ====$/, '$1');
      return (
        <h4 key={index} className="decision-subheader">
          {text}
        </h4>
      );
    }

    // Обнаруживаем элементы списка
    if (line.startsWith('• ') || line.match(/^\d+\.\s/)) {
      return (
        <div key={index} className="decision-list-item">
          {line}
        </div>
      );
    }

    // Обрабатываем защищенные данные и форматирование
    let processedLine = line;
    
    // Защищенные данные с индикацией
    processedLine = processedLine.replace(
      /<ФИО>([^<]*)<\/ФИО>/g,
      '<span class="protected fio" title="Защищенные персональные данные">[$1]</span>'
    );
    
    processedLine = processedLine.replace(
      /<адрес>([^<]*)<\/адрес>/g,
      '<span class="protected address" title="Защищенный адрес">[$1]</span>'
    );
    
    processedLine = processedLine.replace(
      /<дата>([^<]*)<\/дата>/g,
      '<span class="protected date" title="Защищенная дата">[$1]</span>'
    );
    
    processedLine = processedLine.replace(
      /<номер>([^<]*)<\/номер>/g,
      '<span class="protected number" title="Защищенный номер">[$1]</span>'
    );
    
    processedLine = processedLine.replace(
      /<данные изъяты>([^<]*)<\/данные изъяты>/g,
      '<span class="protected removed" title="Данные изъяты по требованию">[скрыто]</span>'
    );

    // Жирный текст
    processedLine = processedLine.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong>$1</strong>'
    );

    // Курсив
    processedLine = processedLine.replace(
      /_([^_]+)_/g,
      '<em>$1</em>'
    );

    // Обычный абзац
    return (
      <p 
        key={index} 
        className="decision-paragraph"
        dangerouslySetInnerHTML={{ __html: processedLine }}
      />
    );
  };

  // Разбиваем на строки, группируем абзацы
  const renderContent = () => {
    if (!content) return null;

    // Разбиваем по двойным переносам строк (абзацы)
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, paraIndex) => {
      const lines = paragraph.split('\n').filter(line => line.trim());
      
      // Если это список (все строки начинаются с маркера)
      const isList = lines.every(line => 
        line.startsWith('• ') || line.match(/^\d+\.\s/)
      );
      
      if (isList) {
        return (
          <div key={paraIndex} className="decision-list">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="decision-list-item">
                {line.replace(/^[•\d\.\s]+/, '')}
              </div>
            ))}
          </div>
        );
      }

      // Обычный абзац с несколькими строками
      return (
        <div key={paraIndex} className="decision-paragraph-group">
          {lines.map((line, lineIndex) => renderFormattedLine(line, `${paraIndex}-${lineIndex}`))}
        </div>
      );
    });
  };

  return (
    <div className={`decision-text ${className}`}>
      <div 
        ref={containerRef}
        className={`decision-container ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div ref={textRef}>
          {renderContent()}
        </div>
      </div>
      
      {needsExpansion && !isExpanded && (
        <div className="decision-fade">
          <button 
            className="decision-expand-button"
            onClick={() => setIsExpanded(true)}
          >
            Показать полностью ↓
          </button>
        </div>
      )}
      
      {needsExpansion && isExpanded && (
        <button 
          className="decision-collapse-button"
          onClick={() => setIsExpanded(false)}
        >
          Свернуть ↑
        </button>
      )}
    </div>
  );
};

export default DecisionText;