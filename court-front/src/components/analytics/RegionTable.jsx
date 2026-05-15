import React from 'react';
import '../../styles/RegionTable.css';

const RegionTable = ({ data, columns }) => {
  const safeData = data?.filter(row => row != null) || [];
  
  return (
    <div className="region-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => {
                const value = row?.[col.key] ?? null;
                
                return (
                  <td key={col.key}>
                    {col.render ? col.render(value, row) : (value ?? '—')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {safeData.length === 0 && (
        <div className="region-table-empty">Нет данных</div>
      )}
    </div>
  );
};

export default RegionTable;