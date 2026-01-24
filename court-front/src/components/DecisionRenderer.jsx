// src/components/DecisionRenderer.jsx
import React, { useState, useMemo } from 'react';
import './DecisionRenderer.css';

const DecisionRenderer = ({ content, showLineNumbers = false, maxHeight = null }) => {
  const [expanded, setExpanded] = useState(false);

  // Разбираем контент на абзацы и форматируем
  const formattedContent = useMemo(() => {
    if (!content) return [];
    
    // Разделяем на абзацы (пустые строки)
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Проверяем заголовки
      if (paragraph.match(/^### .* ###$/)) {
        const title = paragraph.replace(/^### (.*) ###$/, '$1');
        return { type: 'title', content: title, key: index };
      }
      
      // Проверяем подзаголовки
      if (paragraph.match(/^==== .* ====$/)) {
        const subtitle = paragraph.replace(/^==== (.*) ====$/, '$1');
        return { type: 'subtitle', content: subtitle, key: index };
      }
      
      // Проверяем жирный текст
      const boldMatches = paragraph.match(/\*\*(.*?)\*\*/g);
      let processedParagraph = paragraph;
      if (boldMatches) {
        boldMatches.forEach(match => {
          const text = match.slice(2, -2);
          processedParagraph = processedParagraph.replace(match, `<strong>${text}</strong>`);
        });
      }
      
      // Проверяем курсив
      const italicMatches = paragraph.match(/_(.*?)_/g);
      if (italicMatches) {
        italicMatches.forEach(match => {
          const text = match.slice(1, -1);
          processedParagraph = processedParagraph.replace(match, `<em>${text}</em>`);
        });
      }
      
      // Проверяем списки
      if (paragraph.startsWith('• ') || paragraph.match(/^\d+\.\s/)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return { type: 'list', items, key: index };
      }
      
      // Обычный абзац
      return { type: 'paragraph', content: processedParagraph, key: index };
    });
  }, [content]);

  const renderContent = () => {
    return formattedContent.map((item) => {
      switch (item.type) {
        case 'title':
          return (
            <h3 key={item.key} className="decision-title">
              {item.content}
            </h3>
          );
        case 'subtitle':
          return (
            <h4 key={item.key} className="decision-subtitle">
              {item.content}
            </h4>
          );
        case 'list':
          return (
            <ul key={item.key} className="decision-list">
              {item.items.map((listItem, idx) => (
                <li key={idx} className="decision-list-item">
                  {listItem}
                </li>
              ))}
            </ul>
          );
        case 'paragraph':
          return (
            <p 
              key={item.key} 
              className="decision-paragraph"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          );
        default:
          return (
            <p key={item.key} className="decision-paragraph">
              {item.content}
            </p>
          );
      }
    });
  };

  // Считаем количество символов для кнопки "Показать полностью"
  const characterCount = content ? content.length : 0;
  const shouldShowExpandButton = maxHeight && characterCount > 5000;

  return (
    <div className="decision-renderer">
      {showLineNumbers && (
        <div className="decision-meta">
          <span className="char-count">~{Math.ceil(characterCount / 1500)} стр.</span>
          <span className="char-count">{characterCount} симв.</span>
        </div>
      )}
      
      <div 
        className={`decision-content ${expanded ? 'expanded' : ''}`}
        style={maxHeight && !expanded ? { maxHeight: `${maxHeight}px` } : {}}
      >
        {renderContent()}
      </div>
      
      {shouldShowExpandButton && (
        <button 
          className="expand-button"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Свернуть' : 'Показать полностью'}
        </button>
      )}
    </div>
  );
};

export default DecisionRenderer;