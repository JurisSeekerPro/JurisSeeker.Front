// src/components/DecisionText.jsx
import React, { useState, useEffect, useRef } from 'react';
import './../styles/DecisionText.css';

const DecisionText = ({ content, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [processedContent, setProcessedContent] = useState('');
  const containerRef = useRef(null);
  const textRef = useRef(null);

  // Функция для определения, нужен ли отступ на основе содержания
  const shouldHaveIndent = (text) => {
    if (!text || text.trim().length < 10) return false;
    
    // Определяем типы текста, которые НЕ должны иметь отступ
    const noIndentPatterns = [
      /^к делу №/i,
      /^РЕШЕНИЕ$/i,
      /^Именем Российской Федерации$/i,
      /^УСТАНОВИЛ:$/i,
      /^РЕШИЛ:$/i,
      /^Дело №/i,
      /^Судья\s+[А-ЯЁ]/i,
      /^Председательствующий/i,
      /^\d{1,2}\s+[а-яё]+\s+\d{4}/i, // Дата в начале строки
      /^\d{1,2}\.\d{1,2}\.\d{4}/,   // Дата в формате ДД.ММ.ГГГГ
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.\s*[А-ЯЁ]\./i, // ФИО в начале
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\./i,    // ФИО с инициалами
    ];
    
    // Проверяем, соответствует ли текст шаблонам без отступа
    for (const pattern of noIndentPatterns) {
      if (pattern.test(text)) return false;
    }
    
    // Для остального текста - даем отступ
    return true;
  };

  // Обработка контента при загрузке
  useEffect(() => {
    if (!content) return;

    const processContent = (html) => {
      // 1. Удаляем пустые title
      html = html.replace(/<title><\/title>/g, '');
      
      // 2. УДАЛЯЕМ защищенные теги, оставляя только текст внутри
      html = html
        .replace(/<ФИО>([^<]*)<\/ФИО>/gi, '$1')
        .replace(/<адрес>([^<]*)<\/адрес>/gi, '$1')
        .replace(/<дата>([^<]*)<\/дата>/gi, '$1')
        .replace(/<номер>([^<]*)<\/номер>/gi, '$1')
        .replace(/<данные изъяты>([^<]*)<\/данные изъяты>/gi, '[скрыто]')
        .replace(/<адрес><адрес>([^<]*)<\/адрес><\/адрес>/gi, '$1');
      
      // 3. Парсим HTML с помощью DOMParser для точной обработки
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 4. Обрабатываем все элементы
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          const text = node.textContent.trim();
          
          // Для тега p - определяем стиль
          if (tagName === 'p') {
            const style = node.getAttribute('style') || '';
            const hasCenter = style.includes('TEXT-ALIGN: center') || 
                             style.includes('text-align: center');
            const hasJustify = style.includes('TEXT-ALIGN: justify') || 
                              style.includes('text-align: justify');
            const hasRight = style.includes('TEXT-ALIGN: right') || 
                            style.includes('text-align: right');
            const hasIndent = style.includes('TEXT-INDENT') || 
                             style.includes('text-indent');
            
            // Определяем классы на основе стилей И содержания
            let classes = 'decision-block';
            
            // Выравнивание
            if (hasCenter) classes += ' text-center';
            if (hasJustify) classes += ' text-justify';
            if (hasRight) classes += ' text-right';
            
            // Отступ - учитываем и стиль, и содержание
            const needsIndent = hasIndent || shouldHaveIndent(text);
            if (needsIndent) classes += ' has-indent';
            
            // Специальные классы на основе содержания
            if (/^к делу №/i.test(text)) {
              classes += ' case-reference';
            } else if (/^РЕШЕНИЕ$/i.test(text)) {
              classes += ' main-title';
            } else if (/^Именем Российской Федерации$/i.test(text)) {
              classes += ' document-title';
            } else if (/^УСТАНОВИЛ:$/i.test(text)) {
              classes += ' section-title';
            } else if (/^РЕШИЛ:$/i.test(text)) {
              classes += ' section-title decision-title';
            } else if (/^Дело №/i.test(text)) {
              classes += ' case-number';
            } else if (/^Судья\s+[А-ЯЁ]/i.test(text) || 
                      /^Председательствующий/i.test(text)) {
              classes += ' judge-signature';
            } else if (/^\d{1,2}\s+[а-яё]+\s+\d{4}/i.test(text) || 
                      /^\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) {
              classes += ' date-paragraph';
            }
            
            // Обрабатываем дочерние элементы
            let childContent = '';
            Array.from(node.childNodes).forEach(child => {
              childContent += processNode(child);
            });
            
            return `<div class="${classes}">${childContent}</div>`;
          }
          
          // Для других тегов
          if (tagName === 'table') {
            return `<table class="decision-table">${node.innerHTML}</table>`;
          }
          
          if (tagName === 'center') {
            return `<div class="text-center">${node.innerHTML}</div>`;
          }
          
          if (tagName === 'span') {
            return `<span>${node.innerHTML}</span>`;
          }
          
          // Рекурсивно обрабатываем другие элементы
          let result = `<${tagName}`;
          
          // Копируем атрибуты (кроме style для p-тегов)
          Array.from(node.attributes).forEach(attr => {
            if (tagName !== 'p' || attr.name !== 'style') {
              result += ` ${attr.name}="${attr.value}"`;
            }
          });
          
          result += '>';
          
          Array.from(node.childNodes).forEach(child => {
            result += processNode(child);
          });
          
          result += `</${tagName}>`;
          return result;
        }
        
        return '';
      };
      
      // Обрабатываем весь документ
      let result = '';
      Array.from(doc.body.childNodes).forEach(child => {
        result += processNode(child);
      });
      
      // 5. Очищаем лишние пробелы и пустые блоки
      result = result
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/<div class="decision-block">\s*<\/div>/g, '')
        .trim();
      
      return result;
    };

    setProcessedContent(processContent(content));
  }, [content]);

  // Определяем, нужна ли кнопка "Показать полностью"
  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textHeight = textRef.current.scrollHeight;
      const containerHeight = containerRef.current.clientHeight;
      setNeedsExpansion(textHeight > 600);
    }
  }, [processedContent]);

  const createMarkup = (html) => {
    return { __html: html };
  };

  return (
    <div className={`decision-text ${className}`}>
      <div 
        ref={containerRef}
        className={`decision-container ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        {processedContent ? (
          <div 
            className="decision-content"
            ref={textRef}
            dangerouslySetInnerHTML={createMarkup(processedContent)}
          />
        ) : (
          <div className="decision-empty">Текст решения отсутствует</div>
        )}
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