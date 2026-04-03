import React from 'react';
import '../../styles/Chart.css';

const Chart = ({ data, type = 'bar', title }) => {
  // Защита от null/undefined данных
  const safeData = data?.filter(item => item != null && item.value != null) || [];
  
  // Если нет данных, показываем заглушку
  if (safeData.length === 0) {
    return (
      <div className="chart-container">
        {title && <h3 className="chart-title">{title}</h3>}
        <div className="chart-empty">Нет данных для отображения</div>
      </div>
    );
  }
  
  const maxValue = Math.max(...safeData.map(d => d.value));
  
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart">
        {safeData.map((item, idx) => (
          <div key={idx} className="chart-bar-group">
            <div className="chart-bar-label">{item.label || '—'}</div>
            <div className="chart-bar-wrapper">
              <div 
                className="chart-bar"
                style={{ 
                  width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
                  backgroundColor: item.color || '#4361ee'
                }}
              />
              <span className="chart-bar-value">{item.value.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;