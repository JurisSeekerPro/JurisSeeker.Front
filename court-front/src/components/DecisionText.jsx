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
      /^Р Е Ш Е Н И Е$/i, // Для случая с пробелами
      /^Именем Российской Федерации$/i,
      /^УСТАНОВИЛ:$/i,
      /^У С Т А Н О В И Л:$/i, // Для случая с пробелами
      /^РЕШИЛ:$/i,
      /^Р Е Ш И Л:$/i, // Для случая с пробелами
      /^Дело №/i,
      /^Судья\s+[А-ЯЁ]/i,
      /^Председательствующий/i,
      /^\d{1,2}\s+[а-яё]+\s+\d{4}/i, // Дата в начале строки
      /^\d{1,2}\.\d{1,2}\.\d{4}/,   // Дата в формате ДД.ММ.ГГГГ
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.\s*[А-ЯЁ]\./i, // ФИО в начале
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\./i,    // ФИО с инициалами
      /^УИД\s+\d+/i, // УИД номер
    ];
    
    // Проверяем, соответствует ли текст шаблонам без отступа
    for (const pattern of noIndentPatterns) {
      if (pattern.test(text)) return false;
    }
    
    // Для остального текста - даем отступ
    return true;
  };

  // Очистка HTML от мусора в начале
  const cleanHTMLStart = (html) => {
    // 1. Удаляем HTML entities типа &nbsp;
    html = html.replace(/&nbsp;/gi, ' ');
    html = html.replace(/&amp;/gi, '&');
    html = html.replace(/&lt;/gi, '<');
    html = html.replace(/&gt;/gi, '>');
    html = html.replace(/&quot;/gi, '"');
    html = html.replace(/&#39;/gi, "'");
    
    // 2. Удаляем конкретные артефакты типа "bsp;"
    html = html.replace(/bsp;\s*/gi, '');
    
    // 3. Находим начало реального текста решения
    // Ищем первый осмысленный параграф
    const firstMeaningfulParagraph = html.search(/<p[^>]*>.*?(к делу|Дело|РЕШЕНИЕ|Именем|Установил|Рассмотрев)/i);
    
    if (firstMeaningfulParagraph > 0) {
      // Удаляем всё до первого осмысленного параграфа
      html = html.substring(firstMeaningfulParagraph);
    }
    
    // 4. Удаляем все теги кроме <p> и их содержимого до первого <p>
    const firstPTag = html.indexOf('<p');
    if (firstPTag > 0) {
      html = html.substring(firstPTag);
    }
    
    return html;
  };

  // Обработка контента при загрузке
  useEffect(() => {
    if (!content) return;

    const processContent = (html) => {
      // 1. ОЧИСТКА НАЧАЛА ДОКУМЕНТА
      html = cleanHTMLStart(html);
      
      // 2. УДАЛЯЕМ ВСЕ ЛИШНИЕ ТЕГИ И ВЫРЕЗКИ
      html = html
        // Удаляем пустые title
        .replace(/<title><\/title>/g, '')
        // Удаляем blockquote теги и их атрибуты
        .replace(/<blockquote[^>]*>/gi, '')
        .replace(/<\/blockquote>/gi, '')
        // Удаляем div с любыми классами до первого <p>
        .replace(/<div[^>]*>[\s\S]*?(?=<p)/gi, '')
        .replace(/<\/div>/gi, '')
        // Удаляем h3 заголовки
        .replace(/<h3[^>]*>.*?<\/h3>/gi, '')
        // Удаляем itemprop атрибуты
        .replace(/itemprop="[^"]*"/gi, '')
        // Удаляем пустые параграфы
        .replace(/<p[^>]*>\s*<\/p>/g, '');
      
      // 3. УДАЛЯЕМ защищенные теги, оставляя только текст внутри
      html = html
        .replace(/<ФИО>([^<]*)<\/ФИО>/gi, '$1')
        .replace(/<адрес>([^<]*)<\/адрес>/gi, '$1')
        .replace(/<дата>([^<]*)<\/дата>/gi, '$1')
        .replace(/<номер>([^<]*)<\/номер>/gi, '$1')
        .replace(/<данные изъяты>([^<]*)<\/данные изъяты>/gi, '[скрыто]')
        .replace(/<адрес><адрес>([^<]*)<\/адрес><\/адрес>/gi, '$1');
      
      // 4. Используем DOMParser для безопасного парсинга
      const parser = new DOMParser();
      let doc;
      
      try {
        // Оборачиваем в div для корректного парсинга
        doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
      } catch (error) {
        console.error('Ошибка парсинга HTML:', error);
        // Возвращаем очищенный текст как есть
        return html.replace(/<[^>]+>/g, '');
      }
      
      // 5. Обрабатываем все элементы
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Очищаем текст от лишних пробелов, но сохраняем нормальные
          let text = node.textContent;
          text = text.replace(/\s+/g, ' ');
          text = text.replace(/^\s+|\s+$/g, '');
          return text;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          
          // ИГНОРИРУЕМ НЕНУЖНЫЕ ТЕГИ
          if (tagName === 'blockquote' || tagName === 'h3' || tagName === 'div') {
            // Просто обрабатываем детей, игнорируя сам тег
            let result = '';
            Array.from(node.childNodes).forEach(child => {
              result += processNode(child);
            });
            return result;
          }
          
          // Для тега p - определяем стиль
          if (tagName === 'p') {
            const style = node.getAttribute('style') || '';
            const text = node.textContent.trim();
            
            // Пропускаем пустые параграфы
            if (!text) return '';
            
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
            } else if (/^РЕШЕНИЕ$/i.test(text) || /^Р Е Ш Е Н И Е$/i.test(text)) {
              classes += ' main-title';
            } else if (/^Именем Российской Федерации$/i.test(text)) {
              classes += ' document-title';
            } else if (/^УСТАНОВИЛ:$/i.test(text) || /^У С Т А Н О В И Л:$/i.test(text)) {
              classes += ' section-title';
            } else if (/^РЕШИЛ:$/i.test(text) || /^Р Е Ш И Л:$/i.test(text)) {
              classes += ' section-title decision-title';
            } else if (/^Дело №/i.test(text)) {
              classes += ' case-number';
            } else if (/^Судья\s+[А-ЯЁ]/i.test(text) || 
                      /^Председательствующий/i.test(text)) {
              classes += ' judge-signature';
            } else if (/^УИД\s+\d+/i.test(text)) {
              classes += ' case-reference';
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
          
          // Для других тегов - просто обрабатываем содержимое
          let result = '';
          Array.from(node.childNodes).forEach(child => {
            result += processNode(child);
          });
          
          return result;
        }
        
        return '';
      };
      
      // 6. Обрабатываем весь документ
      let result = '';
      const body = doc.querySelector('div'); // Берем наш оберточный div
      if (body) {
        Array.from(body.childNodes).forEach(child => {
          result += processNode(child);
        });
      }
      
      // 7. ОЧИЩАЕМ РЕЗУЛЬТАТ ОТ ПУСТЫХ БЛОКОВ И ЛИШНИХ ПРОБЕЛОВ
      result = result
        // Удаляем полностью пустые блоки
        .replace(/<div class="[^"]*">\s*<\/div>/g, '')
        // Удаляем блоки только с пробелами
        .replace(/<div[^>]*>\s+<\/div>/g, '')
        // Убираем лишние пробелы между тегами
        .replace(/>\s+</g, '><')
        // Убираем множественные пробелы
        .replace(/\s+/g, ' ')
        // Удаляем пробелы в начале и конце
        .replace(/^\s+/, '')
        .replace(/\s+$/, '')
        .trim();
      
      // 8. Если после очистки ничего не осталось, возвращаем сообщение
      if (!result || result.replace(/<[^>]+>/g, '').trim() === '') {
        return '<div class="decision-block">Текст решения не содержит форматированного контента</div>';
      }
      
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