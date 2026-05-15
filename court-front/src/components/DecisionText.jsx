import React, { useState, useEffect, useRef } from 'react';
import './../styles/DecisionText.css';

const DecisionText = ({ content, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [processedContent, setProcessedContent] = useState('');
  const containerRef = useRef(null);
  const textRef = useRef(null);

  const shouldHaveIndent = (text) => {
    if (!text || text.trim().length < 10) return false;
    
    const noIndentPatterns = [
      /^к делу №/i,
      /^РЕШЕНИЕ$/i,
      /^Р Е Ш Е Н И Е$/i, 
      /^Именем Российской Федерации$/i,
      /^УСТАНОВИЛ:$/i,
      /^У С Т А Н О В И Л:$/i,
      /^РЕШИЛ:$/i,
      /^Р Е Ш И Л:$/i, 
      /^Дело №/i,
      /^Судья\s+[А-ЯЁ]/i,
      /^Председательствующий/i,
      /^\d{1,2}\s+[а-яё]+\s+\d{4}/i, 
      /^\d{1,2}\.\d{1,2}\.\d{4}/,   
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.\s*[А-ЯЁ]\./i, 
      /^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\./i,   
      /^УИД\s+\d+/i, 
    ];
    
    for (const pattern of noIndentPatterns) {
      if (pattern.test(text)) return false;
    }
    
    return true;
  };

  const cleanHTMLStart = (html) => {
    html = html.replace(/&nbsp;/gi, ' ');
    html = html.replace(/&amp;/gi, '&');
    html = html.replace(/&lt;/gi, '<');
    html = html.replace(/&gt;/gi, '>');
    html = html.replace(/&quot;/gi, '"');
    html = html.replace(/&#39;/gi, "'");
    
    html = html.replace(/bsp;\s*/gi, '');
    
    const firstMeaningfulParagraph = html.search(/<p[^>]*>.*?(к делу|Дело|РЕШЕНИЕ|Именем|Установил|Рассмотрев)/i);
    
    if (firstMeaningfulParagraph > 0) {
      html = html.substring(firstMeaningfulParagraph);
    }
    
    const firstPTag = html.indexOf('<p');
    if (firstPTag > 0) {
      html = html.substring(firstPTag);
    }
    
    return html;
  };

  useEffect(() => {
    if (!content) return;

    const processContent = (html) => {
      html = cleanHTMLStart(html);
      
      html = html
        .replace(/<title><\/title>/g, '')
        .replace(/<blockquote[^>]*>/gi, '')
        .replace(/<\/blockquote>/gi, '')
        .replace(/<div[^>]*>[\s\S]*?(?=<p)/gi, '')
        .replace(/<\/div>/gi, '')
        .replace(/<h3[^>]*>.*?<\/h3>/gi, '')
        .replace(/itemprop="[^"]*"/gi, '')
        .replace(/<p[^>]*>\s*<\/p>/g, '');
      
      html = html
        .replace(/<ФИО>([^<]*)<\/ФИО>/gi, '$1')
        .replace(/<адрес>([^<]*)<\/адрес>/gi, '$1')
        .replace(/<дата>([^<]*)<\/дата>/gi, '$1')
        .replace(/<номер>([^<]*)<\/номер>/gi, '$1')
        .replace(/<данные изъяты>([^<]*)<\/данные изъяты>/gi, '[скрыто]')
        .replace(/<адрес><адрес>([^<]*)<\/адрес><\/адрес>/gi, '$1');
      
      const parser = new DOMParser();
      let doc;
      
      try {
        doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
      } catch (error) {
        console.error('Ошибка парсинга HTML:', error);
        return html.replace(/<[^>]+>/g, '');
      }
      
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let text = node.textContent;
          text = text.replace(/\s+/g, ' ');
          text = text.replace(/^\s+|\s+$/g, '');
          return text;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();
          
          if (tagName === 'blockquote' || tagName === 'h3' || tagName === 'div') {
            let result = '';
            Array.from(node.childNodes).forEach(child => {
              result += processNode(child);
            });
            return result;
          }
          
          if (tagName === 'p') {
            const style = node.getAttribute('style') || '';
            const text = node.textContent.trim();
            
            if (!text) return '';
            
            const hasCenter = style.includes('TEXT-ALIGN: center') || 
                             style.includes('text-align: center');
            const hasJustify = style.includes('TEXT-ALIGN: justify') || 
                              style.includes('text-align: justify');
            const hasRight = style.includes('TEXT-ALIGN: right') || 
                            style.includes('text-align: right');
            const hasIndent = style.includes('TEXT-INDENT') || 
                             style.includes('text-indent');
            
            let classes = 'decision-block';
            
            if (hasCenter) classes += ' text-center';
            if (hasJustify) classes += ' text-justify';
            if (hasRight) classes += ' text-right';
            
            const needsIndent = hasIndent || shouldHaveIndent(text);
            if (needsIndent) classes += ' has-indent';
            
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
            
            let childContent = '';
            Array.from(node.childNodes).forEach(child => {
              childContent += processNode(child);
            });
            
            return `<div class="${classes}">${childContent}</div>`;
          }
          
          let result = '';
          Array.from(node.childNodes).forEach(child => {
            result += processNode(child);
          });
          
          return result;
        }
        
        return '';
      };
      
      let result = '';
      const body = doc.querySelector('div'); 
      if (body) {
        Array.from(body.childNodes).forEach(child => {
          result += processNode(child);
        });
      }
      
      result = result
        .replace(/<div class="[^"]*">\s*<\/div>/g, '')
        .replace(/<div[^>]*>\s+<\/div>/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/^\s+/, '')
        .replace(/\s+$/, '')
        .trim();
      
      if (!result || result.replace(/<[^>]+>/g, '').trim() === '') {
        return '<div class="decision-block">Текст решения не содержит форматированного контента</div>';
      }
      
      return result;
    };

    setProcessedContent(processContent(content));
  }, [content]);

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