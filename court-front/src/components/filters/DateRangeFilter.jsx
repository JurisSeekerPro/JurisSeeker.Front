// src/components/filters/DateRangeFilter.jsx
import React from 'react';

export default function DateRangeFilter({ 
  label, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) {
  return (
    <div className="mb-md">
      <label className="label">{label}</label>
      <div className="grid grid-2 gap-sm">
        <div>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="От"
          />
        </div>
        <div>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="До"
          />
        </div>
      </div>
    </div>
  );
}